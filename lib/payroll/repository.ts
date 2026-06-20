import JSZip from "jszip";
import { Permission, Role } from "node-appwrite";
import { buckets, collections, env } from "@/lib/env";
import { createAdminClient, ID, Query } from "@/lib/appwrite/server";
import { amountInWords, calculateNet } from "@/lib/payroll/calculations";
import { generateSalarySlipPdf } from "@/lib/payroll/pdf";
import { sendSalarySlipEmail } from "@/lib/payroll/email";
import type { ParsedWorkbook, PayrollRecord } from "@/types/payroll";

function publicRead() {
  return [Permission.read(Role.users())];
}

function monthLabel(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

async function createStorageFile(bucketId: string, name: string, data: Buffer, type = "application/octet-stream") {
  const { storage } = createAdminClient();
  // Convert Buffer to Uint8Array for File constructor compatibility
  const uint8Array = new Uint8Array(data);
  const file = new File([uint8Array], name, { type });
  return storage.createFile(bucketId, ID.unique(), file, publicRead());
}

export async function assertNoDuplicateUpload(month: number, year: number) {
  const { databases } = createAdminClient();
  const existing = await databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.salaryUploads, [
    Query.equal("salaryMonth", month),
    Query.equal("salaryYear", year),
    Query.limit(1)
  ]);
  if (existing.total > 0) throw new Error(`Salary upload already exists for ${monthLabel(month, year)}.`);
}

export async function processPayrollUpload(input: {
  workbook: ParsedWorkbook;
  excelFile: File;
  logoFile?: File | null;
  month: number;
  year: number;
  sendEmail: boolean;
  uploadedBy: string;
}) {
  await assertNoDuplicateUpload(input.month, input.year);
  const { databases, storage } = createAdminClient();
  const excelBuffer = Buffer.from(await input.excelFile.arrayBuffer());
  const excelStorage = await createStorageFile(buckets.uploads, input.excelFile.name, excelBuffer, input.excelFile.type);

  let logoFileId: string | undefined;
  let logoBytes: Uint8Array | undefined;
  if (input.logoFile && input.logoFile.size > 0) {
    const logoBuffer = Buffer.from(await input.logoFile.arrayBuffer());
    logoBytes = logoBuffer;
    const logoStorage = await createStorageFile(buckets.uploads, input.logoFile.name, logoBuffer, input.logoFile.type);
    logoFileId = logoStorage.$id;
  }

  const upload = await databases.createDocument(env.APPWRITE_DATABASE_ID, collections.salaryUploads, ID.unique(), {
    salaryMonth: input.month,
    salaryYear: input.year,
    uploadedBy: input.uploadedBy,
    excelFileId: excelStorage.$id,
    logoFileId: logoFileId ?? "",
    sendEmail: input.sendEmail,
    status: "processing",
    totalEmployees: input.workbook.employees.length,
    processedEmployees: 0,
    failedEmployees: 0,
    zipFileId: "",
    createdAt: new Date().toISOString()
  });

  const company = await databases.createDocument(env.APPWRITE_DATABASE_ID, collections.companies, ID.unique(), {
    ...input.workbook.company,
    logoFileId: logoFileId ?? "",
    uploadId: upload.$id,
    createdAt: new Date().toISOString()
  });

  const salaryByEmployee = new Map(input.workbook.salaries.map((salary) => [salary.employeeId, salary]));
  const deductionsByEmployee = new Map(input.workbook.deductions.map((deduction) => [deduction.employeeId, deduction]));
  const zip = new JSZip();
  const results: PayrollRecord[] = [];
  let failedEmployees = 0;

  for (const employee of input.workbook.employees) {
    const salary = salaryByEmployee.get(employee.employeeId);
    const deductions = deductionsByEmployee.get(employee.employeeId);
    if (!salary || !deductions) {
      failedEmployees += 1;
      continue;
    }

    const netSalary = calculateNet(salary.grossEarnings, deductions.totalDeductions);
    const record: PayrollRecord = {
      uploadId: upload.$id,
      month: input.month,
      year: input.year,
      company: { ...input.workbook.company, logoFileId },
      employee,
      salary,
      deductions,
      netSalary,
      amountInWords: amountInWords(netSalary),
      emailStatus: input.sendEmail ? "pending" : "pending"
    };

    await databases.createDocument(env.APPWRITE_DATABASE_ID, collections.employees, ID.unique(), {
      ...employee,
      uploadId: upload.$id,
      companyId: company.$id,
      createdAt: new Date().toISOString()
    });

    const pdfBuffer = await generateSalarySlipPdf(record, logoBytes);
    const pdfName = `${employee.employeeId}-${input.year}-${String(input.month).padStart(2, "0")}-salary-slip.pdf`;
    zip.file(pdfName, pdfBuffer);
    const pdfStorage = await createStorageFile(buckets.pdfs, pdfName, pdfBuffer, "application/pdf");

    let emailStatus: "pending" | "sent" | "failed" = input.sendEmail ? "pending" : "pending";
    let emailError = "";
    if (input.sendEmail) {
      try {
        await sendSalarySlipEmail(record, pdfBuffer);
        emailStatus = "sent";
      } catch (error) {
        emailStatus = "failed";
        emailError = error instanceof Error ? error.message : "Email failed.";
      }
    }

    const salaryRecord = await databases.createDocument(env.APPWRITE_DATABASE_ID, collections.salaryRecords, ID.unique(), {
      uploadId: upload.$id,
      companyId: company.$id,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      department: employee.department,
      email: employee.email,
      salaryMonth: input.month,
      salaryYear: input.year,
      salary: JSON.stringify(salary),
      deductions: JSON.stringify(deductions),
      grossSalary: salary.grossEarnings,
      totalDeductions: deductions.totalDeductions,
      netSalary,
      amountInWords: record.amountInWords,
      pdfFileId: pdfStorage.$id,
      emailStatus,
      createdAt: new Date().toISOString()
    });

    await databases.createDocument(env.APPWRITE_DATABASE_ID, collections.generatedPdfs, ID.unique(), {
      uploadId: upload.$id,
      salaryRecordId: salaryRecord.$id,
      employeeId: employee.employeeId,
      fileId: pdfStorage.$id,
      fileName: pdfName,
      createdAt: new Date().toISOString()
    });

    await databases.createDocument(env.APPWRITE_DATABASE_ID, collections.emailLogs, ID.unique(), {
      uploadId: upload.$id,
      salaryRecordId: salaryRecord.$id,
      employeeId: employee.employeeId,
      email: employee.email,
      status: emailStatus,
      error: emailError,
      sentAt: emailStatus === "sent" ? new Date().toISOString() : ""
    });

    results.push({ ...record, pdfFileId: pdfStorage.$id, emailStatus });
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const zipStorage = await createStorageFile(
    buckets.pdfs,
    `salary-slips-${monthLabel(input.month, input.year)}.zip`,
    zipBuffer,
    "application/zip"
  );

  await databases.updateDocument(env.APPWRITE_DATABASE_ID, collections.salaryUploads, upload.$id, {
    status: "completed",
    processedEmployees: results.length,
    failedEmployees,
    zipFileId: zipStorage.$id,
    completedAt: new Date().toISOString()
  });

  return { uploadId: upload.$id, zipFileId: zipStorage.$id, processed: results.length, failed: failedEmployees };
}

// STATELESS UPLOAD - No database storage
export async function processPayrollUploadStateless(input: {
  workbook: ParsedWorkbook;
  logoFile?: File | null;
  month: number;
  year: number;
  sendEmail: boolean;
}) {
  const zip = new JSZip();
  const results: PayrollRecord[] = [];
  let failedEmployees = 0;
  console.log("Starting stateless payroll processing for month:", input.month, "year:", input.year, "sendEmail:", input.sendEmail);

  // Prepare logo bytes if provided
  let logoBytes: Uint8Array | undefined;
  if (input.logoFile && input.logoFile.size > 0) {
    const logoBuffer = Buffer.from(await input.logoFile.arrayBuffer());
    logoBytes = logoBuffer;
  }
  console.log("Logo file processed, size:", logoBytes ? logoBytes.length : "no logo");

  // Map salary and deduction data
  const salaryByEmployee = new Map(input.workbook.salaries.map((salary) => [salary.employeeId, salary]));
  const deductionsByEmployee = new Map(input.workbook.deductions.map((deduction) => [deduction.employeeId, deduction]));
  console.log("Salary and deduction data mapped for employees, total salaries:", salaryByEmployee.size, "total deductions:", deductionsByEmployee.size);
  // Process each employee
  for (const employee of input.workbook.employees) {
    const salary = salaryByEmployee.get(employee.employeeId);
    const deductions = deductionsByEmployee.get(employee.employeeId);
    console.log(`Processing payroll for ${employee.employeeName} (${employee.employeeId})`);
    if (!salary || !deductions) {
      failedEmployees += 1;
      continue;
    }


    const netSalary = calculateNet(salary.grossEarnings, deductions.totalDeductions);
    const record: PayrollRecord = {
      uploadId: "", // Not needed in stateless mode
      month: input.month,
      year: input.year,
      company: { ...input.workbook.company, logoFileId: "" },
      employee,
      salary,
      deductions,
      netSalary,
      amountInWords: amountInWords(netSalary),
      emailStatus: input.sendEmail ? "pending" : "pending"
    };
    console.log(`Payroll record created for ${employee.employeeName} (${employee.employeeId}), net salary: ${netSalary}`);

    // Generate PDF (returns buffer)
    const pdfBuffer = await generateSalarySlipPdf(record, logoBytes);
    const pdfName = `${employee.employeeId}-${input.year}-${String(input.month).padStart(2, "0")}-salary-slip.pdf`;
    console.log(`Generated PDF for ${employee.employeeName} (${employee.employeeId}), size: ${pdfBuffer.length} bytes`);
    zip.file(pdfName, pdfBuffer);

    // Send email if enabled
    if (input.sendEmail) {
      try {
        await sendSalarySlipEmail(record, pdfBuffer);
      } catch (error) {
        console.error(`Email failed for ${employee.email}:`, error);
        // Continue processing even if email fails
      }
    }

    results.push(record);
  }

  // Generate ZIP file
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return {
    zipBuffer,
    processed: results.length,
    failed: failedEmployees
  };
}

export async function getDashboardStats() {
  const { databases } = createAdminClient();
  const [uploads, employees, records, emails] = await Promise.all([
    databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.salaryUploads, [Query.limit(1)]),
    databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.employees, [Query.limit(1)]),
    databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.salaryRecords, [Query.limit(1)]),
    databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.emailLogs, [Query.limit(100)])
  ]);
  return {
    uploads: uploads.total,
    employees: employees.total,
    records: records.total,
    sentEmails: emails.documents.filter((doc) => doc.status === "sent").length,
    failedEmails: emails.documents.filter((doc) => doc.status === "failed").length
  };
}

export async function listUploads() {
  const { databases } = createAdminClient();
  return databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.salaryUploads, [
    Query.orderDesc("$createdAt"),
    Query.limit(25)
  ]);
}

export async function listSalaryRecords(filters?: { month?: number; year?: number; employee?: string; department?: string }) {
  const queries = [Query.orderDesc("$createdAt"), Query.limit(100)];
  if (filters?.month) queries.push(Query.equal("salaryMonth", filters.month));
  if (filters?.year) queries.push(Query.equal("salaryYear", filters.year));
  if (filters?.department) queries.push(Query.equal("department", filters.department));
  if (filters?.employee) queries.push(Query.search("employeeName", filters.employee));
  const { databases } = createAdminClient();
  return databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.salaryRecords, queries);
}

export async function listEmployees() {
  const { databases } = createAdminClient();
  return databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.employees, [
    Query.orderAsc("employeeName"),
    Query.limit(100)
  ]);
}

export async function listCompanies() {
  const { databases } = createAdminClient();
  return databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.companies, [
    Query.orderDesc("$createdAt"),
    Query.limit(10)
  ]);
}

export async function listGeneratedPdfs() {
  const { databases } = createAdminClient();
  return databases.listDocuments(env.APPWRITE_DATABASE_ID, collections.generatedPdfs, [
    Query.orderDesc("$createdAt"),
    Query.limit(100)
  ]);
}

export function storageDownloadUrl(bucketId: string, fileId: string) {
  return `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/download?project=${env.APPWRITE_PROJECT_ID}`;
}

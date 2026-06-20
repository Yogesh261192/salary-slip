import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/appwrite/server";
import { parseSalaryWorkbook } from "@/lib/payroll/excel";
import { processPayrollUploadStateless } from "@/lib/payroll/repository";
import { assertExcelFile, assertLogoFile, uploadFormSchema } from "@/lib/payroll/validators";


export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    
    const formData = await request.formData();
    const excel = formData.get("excelFile");
    const logo = formData.get("logoFile");
    
    if (!(excel instanceof File)) return NextResponse.json({ error: "Excel file is required." }, { status: 400 });
    
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    assertExcelFile(excel);
    assertLogoFile(logoFile);
    
    const values = uploadFormSchema.parse({
      salaryMonth: formData.get("salaryMonth"),
      salaryYear: formData.get("salaryYear"),
      sendEmail: formData.get("sendEmail") === "on" || formData.get("sendEmail") === "true"
    });
    
    console.log("Processing payroll upload for month:", values.salaryMonth, "year:", values.salaryYear, "sendEmail:", values.sendEmail);
    const workbook = await parseSalaryWorkbook(excel, admin.email);
    console.log("Parsed workbook:", workbook);  
    const result = await processPayrollUploadStateless({
      workbook,
      logoFile,
      month: values.salaryMonth,
      year: values.salaryYear,
      sendEmail: values.sendEmail
    });
    
    // Return ZIP file as response
    return new NextResponse(new Uint8Array(result.zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="salary-slips-${values.salaryYear}-${String(values.salaryMonth).padStart(2, "0")}.zip"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload processing failed." },
      { status: 400 }
    );
  }
}

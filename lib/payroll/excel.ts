import * as XLSX from "xlsx";
import type {
  CompanyDetails,
  DeductionDetails,
  EmployeeDetails,
  PayrollComponent,
  ParsedWorkbook,
  SalaryDetails
} from "@/types/payroll";
import { calculateDeductions, calculateGross, money } from "@/lib/payroll/calculations";

type Row = Record<string, unknown>;

const requiredSheets = [ "Employee Details", "Salary Details", "Deductions"];

function rows(workbook: XLSX.WorkBook, sheetName: string): Row[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Missing required sheet: ${sheetName}`);
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });
}

function cell(row: Row, key: string) {
  return String(row[key] ?? "").trim();
}

function toCamelCase(label: string) {
  const words = label
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : `${lower[0]?.toUpperCase() ?? ""}${lower.slice(1)}`;
    })
    .join("");
}

function moneyColumns(row: Row, knownColumns: Record<string, string>, excludedColumns: string[] = []) {
  const excluded = new Set(["Employee ID", ...excludedColumns]);
  return Object.entries(row)
    .map(([rawLabel, rawValue]) => ({ label: rawLabel.trim(), rawValue }))
    .filter(({ label }) => label && !excluded.has(label))
    .reduce(
      (details, { label, rawValue }) => {
        const key = knownColumns[label] ?? toCamelCase(label);
        const value = money(rawValue);
        details.components.push({ key, label, value });
        details.values[key] = value;
        return details;
      },
      { components: [] as PayrollComponent[], values: {} as Record<string, number> }
    );
}

function dateCell(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    return new Date(parsed.y, parsed.m - 1, parsed.d).toISOString();
  }
  const text = String(value ?? "").trim();
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString();
}

export async function parseSalaryWorkbook(file: File, adminEmail: string): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  console.log("Excel file buffer loaded, size:", buffer.byteLength);
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  for (const sheet of requiredSheets) {
    if (!workbook.SheetNames.includes(sheet)) throw new Error(`Workbook must include "${sheet}" sheet.`);
  }

  // const companyRow = rows(workbook, "Company Details")[0];
  const enterprises : Record<string, CompanyDetails> = {
    "yogeshmamgain2611@gmail.com":{
        companyName: "Arpit Enterprises",
        address: "Shri ram colony, Nathuwala Dhang, Dehradun, Uttarakhand, India",
        phoneNumber: "+91 9627287616",
       gstNumber: "05CLAPP6359LIZO",
    }
    }
  const companyRow = enterprises[adminEmail]? enterprises[adminEmail] : null;
  if (!companyRow) throw new Error("Company Details not found for the provided admin email.");
  const company: CompanyDetails = {
    companyName: companyRow.companyName,
    gstNumber: companyRow.gstNumber,
    address: companyRow.address,
    phoneNumber: companyRow.phoneNumber
  };

  const employees: EmployeeDetails[] = rows(workbook, "Employee Details").map((row) => ({
    employeeId: cell(row, "Employee ID"),
    employeeName: cell(row, "Employee Name"),
    designation: cell(row, "Designation"),
    department: cell(row, "Department"),
    email: cell(row, "Email"),
    mobile: cell(row, "Mobile"),
    pan: cell(row, "PAN"),
    uan: cell(row, "UAN"),
    pfNumber: cell(row, "PF Number"),
    bankName: cell(row, "Bank Name"),
    accountNumber: cell(row, "Account Number"),
    ifsc: cell(row, "IFSC"),
    joiningDate: dateCell(row["Joining Date"])
  }));

  const salaryColumns: Record<string, string> = {
    "Basic Salary": "basicSalary",
    HRA: "hra",
    "Conveyance Allowance": "conveyanceAllowance",
    "Medical Allowance": "medicalAllowance",
    "Special Allowance": "specialAllowance",
    Bonus: "bonus",
    Incentive: "incentive",
    Overtime: "overtime",
    "Other Earnings": "otherEarnings"
  };

  const salaries: SalaryDetails[] = rows(workbook, "Salary Details").map((row) => {
    const { components, values } = moneyColumns(row, salaryColumns, ["Gross Earnings"]);
    const salary = {
      employeeId: cell(row, "Employee ID"),
      components,
      ...values
    };
    return { ...salary, grossEarnings: calculateGross(salary) };
  });

  const deductionColumns: Record<string, string> = {
    PF: "pf",
    ESI: "esi",
    "Professional Tax": "professionalTax",
    TDS: "tds",
    "Loan Recovery": "loanRecovery",
    "Advance Salary": "advanceSalary",
    "Other Deductions": "otherDeductions"
  };

  const deductions: DeductionDetails[] = rows(workbook, "Deductions").map((row) => {
    const { components, values } = moneyColumns(row, deductionColumns, ["Total Deductions"]);
    const deduction = {
      employeeId: cell(row, "Employee ID"),
      components,
      ...values
    };
    return { ...deduction, totalDeductions: calculateDeductions(deduction) };
  });

  const ids = new Set(employees.map((employee) => employee.employeeId));
  for (const employee of employees) {
    if (!employee.employeeId || !employee.employeeName || !employee.email) {
      throw new Error("Every employee must include Employee ID, Employee Name, and Email.");
    }
  }
  for (const salary of salaries) {
    if (!ids.has(salary.employeeId)) throw new Error(`Salary row has unknown Employee ID: ${salary.employeeId}`);
  }
  for (const deduction of deductions) {
    if (!ids.has(deduction.employeeId)) throw new Error(`Deduction row has unknown Employee ID: ${deduction.employeeId}`);
  }

  return { company, employees, salaries, deductions };
}

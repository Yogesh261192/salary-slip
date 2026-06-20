export type EmailStatus = "pending" | "sent" | "failed";

export type CompanyDetails = {
  companyName: string;
  gstNumber: string;
  address: string;
  phoneNumber: string;
  logoFileId?: string;
  logoUrl?: string;
};

export type EmployeeDetails = {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  email: string;
  mobile: string;
  pan: string;
  uan: string;
  pfNumber: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  joiningDate: string;
};

export type PayrollComponent = {
  key: string;
  label: string;
  value: number;
};

export type SalaryDetails = {
  employeeId: string;
  components: PayrollComponent[];
  basicSalary?: number;
  hra?: number;
  conveyanceAllowance?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  bonus?: number;
  incentive?: number;
  overtime?: number;
  otherEarnings?: number;
  grossEarnings: number;
  [key: string]: string | number | PayrollComponent[] | undefined;
};

export type DeductionDetails = {
  employeeId: string;
  components: PayrollComponent[];
  pf?: number;
  esi?: number;
  professionalTax?: number;
  tds?: number;
  loanRecovery?: number;
  advanceSalary?: number;
  otherDeductions?: number;
  totalDeductions: number;
  [key: string]: string | number | PayrollComponent[] | undefined;
};

export type PayrollRecord = {
  uploadId: string;
  month: number;
  year: number;
  company: CompanyDetails;
  employee: EmployeeDetails;
  salary: SalaryDetails;
  deductions: DeductionDetails;
  netSalary: number;
  amountInWords: string;
  emailStatus: EmailStatus;
  pdfFileId?: string;
  pdfUrl?: string;
};

export type ParsedWorkbook = {
  company: CompanyDetails;
  employees: EmployeeDetails[];
  salaries: SalaryDetails[];
  deductions: DeductionDetails[];
};

const XLSX = require('xlsx');
const fs = require('fs');

// Create workbook
const wb = XLSX.utils.book_new();

// Company Details sheet
const companyData = [
  {
    "Company Name": "Simdi Solutions Pvt Ltd",
    "GST Number": "18AABCU1234H1Z0",
    "Address": "123 Business Park, Tech City, Mumbai, MH 400001",
    "Phone Number": "+91-8765-432-100"
  }
];
const companySheet = XLSX.utils.json_to_sheet(companyData);
XLSX.utils.book_append_sheet(wb, companySheet, "Company Details");

// Employee Details sheet
const employeeData = [
  {
    "Employee ID": "EMP001",
    "Employee Name": "Rajesh Kumar",
    "Designation": "Senior Developer",
    "Department": "Engineering",
    "Email": "rajesh@example.com",
    "Mobile": "9876543210",
    "PAN": "ABCDE1234F",
    "UAN": "100123456789",
    "PF Number": "KA/123456/001",
    "Bank Name": "HDFC Bank",
    "Account Number": "50100123456789",
    "IFSC": "HDFC0000123",
    "Joining Date": new Date(2022, 0, 15)
  },
  {
    "Employee ID": "EMP002",
    "Employee Name": "Priya Sharma",
    "Designation": "Product Manager",
    "Department": "Product",
    "Email": "priya@example.com",
    "Mobile": "9876543211",
    "PAN": "BCDEF1234G",
    "UAN": "100123456790",
    "PF Number": "KA/123456/002",
    "Bank Name": "ICICI Bank",
    "Account Number": "50200123456790",
    "IFSC": "ICIC0000123",
    "Joining Date": new Date(2021, 5, 20)
  },
  {
    "Employee ID": "EMP003",
    "Employee Name": "Amit Patel",
    "Designation": "Junior Developer",
    "Department": "Engineering",
    "Email": "amit@example.com",
    "Mobile": "9876543212",
    "PAN": "CDEFG1234H",
    "UAN": "100123456791",
    "PF Number": "KA/123456/003",
    "Bank Name": "AXIS Bank",
    "Account Number": "50300123456791",
    "IFSC": "AXIS0000123",
    "Joining Date": new Date(2023, 2, 10)
  }
];
const employeeSheet = XLSX.utils.json_to_sheet(employeeData);
XLSX.utils.book_append_sheet(wb, employeeSheet, "Employee Details");

// Salary Details sheet
const salaryData = [
  {
    "Employee ID": "EMP001",
    "Basic Salary": 50000,
    "HRA": 15000,
    "Conveyance Allowance": 2000,
    "Medical Allowance": 1500,
    "Special Allowance": 5000,
    "Bonus": 5000,
    "Incentive": 2000,
    "Overtime": 1000,
    "Other Earnings": 0
  },
  {
    "Employee ID": "EMP002",
    "Basic Salary": 65000,
    "HRA": 19500,
    "Conveyance Allowance": 2000,
    "Medical Allowance": 2000,
    "Special Allowance": 8000,
    "Bonus": 6500,
    "Incentive": 2500,
    "Overtime": 1500,
    "Other Earnings": 500
  },
  {
    "Employee ID": "EMP003",
    "Basic Salary": 35000,
    "HRA": 10500,
    "Conveyance Allowance": 2000,
    "Medical Allowance": 1000,
    "Special Allowance": 3000,
    "Bonus": 3500,
    "Incentive": 1000,
    "Overtime": 500,
    "Other Earnings": 0
  }
];
const salarySheet = XLSX.utils.json_to_sheet(salaryData);
XLSX.utils.book_append_sheet(wb, salarySheet, "Salary Details");

// Deductions sheet
const deductionData = [
  {
    "Employee ID": "EMP001",
    "PF": 6000,
    "ESI": 750,
    "Professional Tax": 200,
    "TDS": 2000,
    "Loan Recovery": 500,
    "Advance Salary": 0,
    "Other Deductions": 200
  },
  {
    "Employee ID": "EMP002",
    "PF": 7800,
    "ESI": 975,
    "Professional Tax": 200,
    "TDS": 3000,
    "Loan Recovery": 1000,
    "Advance Salary": 500,
    "Other Deductions": 300
  },
  {
    "Employee ID": "EMP003",
    "PF": 4200,
    "ESI": 525,
    "Professional Tax": 0,
    "TDS": 1000,
    "Loan Recovery": 0,
    "Advance Salary": 0,
    "Other Deductions": 100
  }
];
const deductionSheet = XLSX.utils.json_to_sheet(deductionData);
XLSX.utils.book_append_sheet(wb, deductionSheet, "Deductions");

// Write file
XLSX.writeFile(wb, 'sample-salary-data.xlsx');
console.log('✓ Sample Excel file generated: sample-salary-data.xlsx');

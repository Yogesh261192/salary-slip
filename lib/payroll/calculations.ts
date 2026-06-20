import type { DeductionDetails, SalaryDetails } from "@/types/payroll";

export function money(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function sumComponentValues(components?: { value: number }[]) {
  return money((components ?? []).reduce((total, component) => total + money(component.value), 0));
}

export function calculateGross(salary: Omit<SalaryDetails, "grossEarnings">) {
  if (Array.isArray(salary.components) && salary.components.length) return sumComponentValues(salary.components);

  return money(
    money(salary.basicSalary) +
      money(salary.hra) +
      money(salary.conveyanceAllowance) +
      money(salary.medicalAllowance) +
      money(salary.specialAllowance) +
      money(salary.bonus) +
      money(salary.incentive) +
      money(salary.overtime) +
      money(salary.otherEarnings)
  );
}

export function calculateDeductions(deductions: Omit<DeductionDetails, "totalDeductions">) {
  if (Array.isArray(deductions.components) && deductions.components.length) return sumComponentValues(deductions.components);

  return money(
    money(deductions.pf) +
      money(deductions.esi) +
      money(deductions.professionalTax) +
      money(deductions.tds) +
      money(deductions.loanRecovery) +
      money(deductions.advanceSalary) +
      money(deductions.otherDeductions)
  );
}

export function calculateNet(gross: number, deductions: number) {
  return money(gross - deductions);
}

export function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen"
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowThousand(n: number): string {
  let text = "";
  if (n >= 100) {
    text += `${ones[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    text += `${tens[Math.floor(n / 10)]} `;
    n %= 10;
  }
  if (n > 0) text += `${ones[n]} `;
  return text.trim();
}

export function amountInWords(amount: number) {
  const rupees = Math.floor(Math.abs(amount));
  if (rupees === 0) return "Zero Rupees Only";
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees / 100000) % 100);
  const thousand = Math.floor((rupees / 1000) % 100);
  const rest = rupees % 1000;
  const parts = [
    crore ? `${belowThousand(crore)} Crore` : "",
    lakh ? `${belowThousand(lakh)} Lakh` : "",
    thousand ? `${belowThousand(thousand)} Thousand` : "",
    rest ? belowThousand(rest) : ""
  ].filter(Boolean);
  return `${parts.join(" ")} Rupees Only`;
}

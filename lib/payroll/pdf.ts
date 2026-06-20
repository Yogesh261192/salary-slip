import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PayrollComponent, PayrollRecord } from "@/types/payroll";
import { formatCurrency } from "@/lib/payroll/calculations";

const pageWidth = 595.28;
const pageHeight = 841.89;

function monthName(month: number) {
  return new Date(2000, month - 1, 1).toLocaleString("en-IN", { month: "long" });
}

function componentRows(components: PayrollComponent[] | undefined, fallbackRows: [string, number | undefined][]) {
  if (components?.length) {
    return components.map((component) => [component.label, component.value] as [string, number]);
  }

  return fallbackRows
    .filter(([, value]) => typeof value === "number")
    .map(([label, value]) => [label, value ?? 0] as [string, number]);
}

export async function generateSalarySlipPdf(record: PayrollRecord, logoBytes?: Uint8Array) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([pageWidth, pageHeight]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const accent = rgb(0.08, 0.48, 0.43);
  const text = rgb(0.09, 0.11, 0.18);
  const muted = rgb(0.42, 0.45, 0.52);
  const line = rgb(0.86, 0.88, 0.92);
  console.log(`Generating PDF for ${JSON.stringify(record)} (${record.employee.employeeId}), month: ${record.month}, year: ${record.year}`);  
  page.drawRectangle({ x: 0, y: pageHeight - 88, width: pageWidth, height: 88, color: accent });
  if (logoBytes?.length) {
    try {
      const image = await pdf.embedPng(logoBytes).catch(() => pdf.embedJpg(logoBytes));
      page.drawImage(image, { x: 36, y: pageHeight - 70, width: 46, height: 46 });
    } catch {
      page.drawRectangle({ x: 36, y: pageHeight - 70, width: 46, height: 46, color: rgb(1, 1, 1), opacity: 0.25 });
    }
  }

  page.drawText(record.company.companyName, { x: 96, y: pageHeight - 38, font: bold, size: 17, color: rgb(1, 1, 1) });
  page.drawText(record.company.address, { x: 96, y: pageHeight - 58, font: regular, size: 9, color: rgb(0.92, 1, 0.98) });
  page.drawText(`GST: ${record.company.gstNumber}  |  Phone: ${record.company.phoneNumber}`, {
    x: 96,
    y: pageHeight - 74,
    font: regular,
    size: 9,
    color: rgb(0.92, 1, 0.98)
  });

  page.drawText("Salary Slip", { x: 36, y: pageHeight - 125, font: bold, size: 22, color: text });
  page.drawText(`${monthName(record.month)} ${record.year}`, { x: 440, y: pageHeight - 120, font: bold, size: 12, color: accent });

  const infoY = pageHeight - 165;
  const left = [
    ["Employee ID", record.employee.employeeId],
    ["Employee Name", record.employee.employeeName],
    ["Designation", record.employee.designation],
    ["Department", record.employee.department],
    ["Joining Date", new Date(record.employee.joiningDate).toLocaleDateString("en-IN")]
  ];
  const right = [
    ["PAN", record.employee.pan],
    ["UAN", record.employee.uan],
    ["PF Number", record.employee.pfNumber],
    ["Bank", record.employee.bankName],
    ["Account / IFSC", `${record.employee.accountNumber} / ${record.employee.ifsc}`]
  ];

  function drawKV(items: string[][], x: number) {
    items.forEach(([label, value], index) => {
      const y = infoY - index * 20;
      page.drawText(label, { x, y, font: regular, size: 8, color: muted });
      page.drawText(value || "-", { x: x + 92, y, font: bold, size: 9, color: text });
    });
  }

  drawKV(left, 36);
  drawKV(right, 315);

  function table(title: string, x: number, y: number, rows: [string, number][], totalLabel: string, total: number) {
    page.drawText(title, { x, y:y+10, font: bold, size: 12, color: accent });
    page.drawRectangle({ x, y: y - 22, width: 250, height: 22, color: rgb(0.95, 0.98, 0.97) });
    page.drawText("Particulars", { x: x + 10, y: y - 15, font: bold, size: 9, color: text });
    page.drawText("Amount", { x: x + 175, y: y - 15, font: bold, size: 9, color: text });
    rows.forEach(([label, value], index) => {
      const rowY = y - 44 - index * 22;
      page.drawLine({ start: { x, y: rowY + 15 }, end: { x: x + 250, y: rowY + 15 }, thickness: 0.5, color: line });
      page.drawText(label, { x: x + 10, y: rowY, font: regular, size: 9, color: text });
      page.drawText(formatCurrency(value), { x: x + 164, y: rowY, font: regular, size: 9, color: text });
    });
    const totalY = y - 44 - rows.length * 22;
    page.drawRectangle({ x, y: totalY - 7, width: 250, height: 25, color: rgb(0.98, 0.94, 0.88) });
    page.drawText(totalLabel, { x: x + 10, y: totalY, font: bold, size: 9, color: text });
    page.drawText(formatCurrency(total), { x: x + 164, y: totalY, font: bold, size: 9, color: text });
  }

  table(
    "Earnings",
    36,
    pageHeight - 280,
    componentRows(record.salary.components, [
      ["Basic Salary", record.salary.basicSalary],
      ["HRA", record.salary.hra],
      ["Conveyance Allowance", record.salary.conveyanceAllowance],
      ["Medical Allowance", record.salary.medicalAllowance],
      ["Special Allowance", record.salary.specialAllowance],
      ["Bonus", record.salary.bonus],
      ["Incentive", record.salary.incentive],
      ["Overtime", record.salary.overtime],
      ["Other Earnings", record.salary.otherEarnings]
    ]),
    "Gross Earnings",
    record.salary.grossEarnings
  );

  table(
    "Deductions",
    309,
    pageHeight - 280,
    componentRows(record.deductions.components, [
      ["PF", record.deductions.pf],
      ["ESI", record.deductions.esi],
      ["Professional Tax", record.deductions.professionalTax],
      ["TDS", record.deductions.tds],
      ["Loan Recovery", record.deductions.loanRecovery],
      ["Advance Salary", record.deductions.advanceSalary],
      ["Other Deductions", record.deductions.otherDeductions]
    ]),
    "Total Deductions",
    record.deductions.totalDeductions
  );

  page.drawRectangle({ x: 36, y: 175, width: 523, height: 64, color: rgb(0.94, 0.98, 0.97) });
  page.drawText("Net Pay", { x: 56, y: 212, font: regular, size: 10, color: muted });
  page.drawText(formatCurrency(record.netSalary), { x: 56, y: 190, font: bold, size: 20, color: accent });
  page.drawText(record.amountInWords, { x: 245, y: 198, font: bold, size: 10, color: text });
  console.log(`Net Salary: ${record.netSalary}, Amount in Words: ${record.amountInWords}`);
  page.drawLine({ start: { x: 395, y: 105 }, end: { x: 540, y: 105 }, thickness: 0.7, color: muted });
  page.drawText("Authorized Signatory", { x: 416, y: 88, font: regular, size: 9, color: muted });
  page.drawText("This is a computer generated salary slip.", { x: 36, y: 44, font: regular, size: 8, color: muted });
  const generatedOn = new Date(record.uploadId).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); 
  return Buffer.from(await pdf.save());
}

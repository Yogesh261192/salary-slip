import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getCurrentAdmin } from "@/lib/appwrite/server";
import { listSalaryRecords } from "@/lib/payroll/repository";

function asRows(documents: any[]) {
  return documents.map((record) => ({
    "Employee ID": record.employeeId,
    "Employee Name": record.employeeName,
    Department: record.department,
    Email: record.email,
    Month: record.salaryMonth,
    Year: record.salaryYear,
    "Gross Salary": record.grossSalary,
    "Total Deductions": record.totalDeductions,
    "Net Salary": record.netSalary,
    "Email Status": record.emailStatus
  }));
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "csv";
  const records = await listSalaryRecords({
    month: url.searchParams.get("month") ? Number(url.searchParams.get("month")) : undefined,
    year: url.searchParams.get("year") ? Number(url.searchParams.get("year")) : undefined,
    employee: url.searchParams.get("employee") || undefined,
    department: url.searchParams.get("department") || undefined
  });
  const rows = asRows(records.documents);

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Payroll Report");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=payroll-report.xlsx"
      }
    });
  }

  if (format === "pdf") {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText("Payroll Report", { x: 36, y: 800, font: bold, size: 18, color: rgb(0.08, 0.48, 0.43) });
    rows.slice(0, 28).forEach((row, index) => {
      const y = 760 - index * 24;
      page.drawText(`${row["Employee Name"]} | ${row.Department} | Net: ${row["Net Salary"]}`, {
        x: 36,
        y,
        font: regular,
        size: 9,
        color: rgb(0.1, 0.12, 0.18)
      });
    });
    return new NextResponse(Buffer.from(await pdf.save()), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=payroll-report.pdf"
      }
    });
  }

  const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=payroll-report.csv"
    }
  });
}

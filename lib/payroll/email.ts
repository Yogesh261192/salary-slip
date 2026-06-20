import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import type { PayrollRecord } from "@/types/payroll";

export function emailEnabled() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendSalarySlipEmail(record: PayrollRecord, pdf: Buffer) {
  if (!emailEnabled()) {
    throw new Error("SMTP configuration is missing.");
  }
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  const period = `${new Date(2000, record.month - 1, 1).toLocaleString("en-IN", { month: "long" })}-${record.year}`;
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: record.employee.email,
    subject: `Salary Slip for ${period}`,
    text: `Dear ${record.employee.employeeName},\n\nPlease find attached your salary slip.\n\nRegards,\n${record.company.companyName}`,
    attachments: [
      {
        filename: `${record.employee.employeeId}-${record.year}-${record.month}-salary-slip.pdf`,
        content: pdf,
        contentType: "application/pdf"
      }
    ]
  });
}

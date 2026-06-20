import { z } from "zod";

export const uploadFormSchema = z.object({
  salaryMonth: z.coerce.number().int().min(1).max(12),
  salaryYear: z.coerce.number().int().min(2000).max(2100),
  sendEmail: z.coerce.boolean().default(false)
});

export function assertExcelFile(file: File) {
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ];
  const validName = /\.(xlsx|xls)$/i.test(file.name);
  if (!validName && !validTypes.includes(file.type)) {
    throw new Error("Upload a valid .xlsx or .xls workbook.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Excel file must be 20 MB or smaller.");
  }
}

export function assertLogoFile(file?: File | null) {
  if (!file || file.size === 0) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Company logo must be PNG, JPG, or WEBP.");
  }
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Company logo must be 3 MB or smaller.");
  }
}

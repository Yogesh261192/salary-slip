import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  APPWRITE_ENDPOINT: z.string().url(),
  APPWRITE_PROJECT_ID: z.string().min(1),
  APPWRITE_API_KEY: z.string().min(1),
  APPWRITE_DATABASE_ID: z.string().min(1),
  APPWRITE_COMPANIES_COLLECTION_ID: z.string().min(1),
  APPWRITE_EMPLOYEES_COLLECTION_ID: z.string().min(1),
  APPWRITE_SALARY_RECORDS_COLLECTION_ID: z.string().min(1),
  APPWRITE_UPLOADS_COLLECTION_ID: z.string().min(1),
  APPWRITE_EMAIL_LOGS_COLLECTION_ID: z.string().min(1),
  APPWRITE_GENERATED_PDFS_COLLECTION_ID: z.string().min(1),
  APPWRITE_UPLOADS_BUCKET_ID: z.string().min(1),
  APPWRITE_PDFS_BUCKET_ID: z.string().min(1),
  ADMIN_ROLE: z.string().default("admin"),
  SESSION_COOKIE_NAME: z.string().default("payroll_admin_session"),
  SESSION_COOKIE_DAYS: z.coerce.number().int().positive().default(7),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Payroll <payroll@example.com>")
});

export const env = envSchema.parse(process.env);

export const collections = {
  companies: env.APPWRITE_COMPANIES_COLLECTION_ID,
  employees: env.APPWRITE_EMPLOYEES_COLLECTION_ID,
  salaryRecords: env.APPWRITE_SALARY_RECORDS_COLLECTION_ID,
  salaryUploads: env.APPWRITE_UPLOADS_COLLECTION_ID,
  emailLogs: env.APPWRITE_EMAIL_LOGS_COLLECTION_ID,
  generatedPdfs: env.APPWRITE_GENERATED_PDFS_COLLECTION_ID
} as const;

export const buckets = {
  uploads: env.APPWRITE_UPLOADS_BUCKET_ID,
  pdfs: env.APPWRITE_PDFS_BUCKET_ID
} as const;

# Salary Slip Management System

Production-ready payroll web application built with Next.js 15 App Router, TypeScript, Tailwind CSS, Appwrite, XLSX parsing, PDF generation, ZIP downloads, and SMTP email delivery.

## Features

- Appwrite admin authentication with protected `/dashboard` routes.
- Salary workbook upload with `.xlsx` and `.xls` validation.
- Four-sheet Excel parser for company, employees, salary details, and deductions.
- Gross salary, total deductions, net salary, and amount-in-words calculation.
- Appwrite Database persistence for companies, employees, salary records, uploads, email logs, and generated PDFs.
- Appwrite Storage for uploaded workbooks, logos, PDFs, and ZIP files.
- Bulk salary slip PDF generation using `pdf-lib`.
- ZIP generation using `jszip`.
- Optional email delivery with employee-specific PDF attachments using Nodemailer.
- Reports with filters and CSV, Excel, and PDF exports.
- Responsive payroll SaaS dashboard with dark-mode-ready styling.

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

If Linux reports `ENOSPC: System limit for number of file watchers reached`, run:

```bash
npm run dev:poll
```

For the permanent system-level fix, see `docs/TROUBLESHOOTING.md`.

## Excel Workbook

The uploaded workbook must contain exactly these sheets:

- `Company Details`
- `Employee Details`
- `Salary Details`
- `Deductions`

Column names must match the schema in `docs/APPWRITE_SETUP.md`.

## Admin Access

Create an Appwrite Auth user and set the user preference:

```json
{
  "role": "admin"
}
```

Only users with this preference can log in.

## Deployment

The app is Vercel-ready. Add all `.env.example` variables to Vercel Project Settings, then deploy from GitHub or with:

```bash
vercel
```

See `docs/DEPLOYMENT.md` for the full checklist.

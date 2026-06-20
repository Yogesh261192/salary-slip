# Appwrite Setup

## Project

Create an Appwrite project and copy:

- Endpoint
- Project ID
- Server API key

The API key must allow Database, Storage, Users, and Account operations.

## Environment Variables

Use `.env.example` as the source of truth.

## Database

Create a database:

- ID: `salary_slip`

## Collections

Use document security where appropriate. The server API key writes all documents. Authenticated users can read generated files through storage permissions.

### companies

Attributes:

- `companyName` string required 255
- `gstNumber` string required 50
- `address` string required 2000
- `phoneNumber` string required 30
- `logoFileId` string 255
- `uploadId` string required 255
- `createdAt` datetime required

Indexes:

- key: `uploadId`

### employees

Attributes:

- `employeeId` string required 100
- `employeeName` string required 255
- `designation` string 255
- `department` string 255
- `email` email required
- `mobile` string 30
- `pan` string 50
- `uan` string 50
- `pfNumber` string 50
- `bankName` string 255
- `accountNumber` string 100
- `ifsc` string 30
- `joiningDate` string 100
- `uploadId` string required 255
- `companyId` string required 255
- `createdAt` datetime required

Indexes:

- key: `employeeId`
- key: `department`
- fulltext: `employeeName`

### salary_records

Attributes:

- `uploadId` string required 255
- `companyId` string required 255
- `employeeId` string required 100
- `employeeName` string required 255
- `department` string 255
- `email` email required
- `salaryMonth` integer required
- `salaryYear` integer required
- `salary` string required 8000
- `deductions` string required 8000
- `grossSalary` float required
- `totalDeductions` float required
- `netSalary` float required
- `amountInWords` string required 1000
- `pdfFileId` string required 255
- `emailStatus` enum `pending`, `sent`, `failed`
- `createdAt` datetime required

Indexes:

- key: `uploadId`
- key: `employeeId`
- key: `salaryMonth`
- key: `salaryYear`
- key: `department`
- fulltext: `employeeName`

### salary_uploads

Attributes:

- `salaryMonth` integer required
- `salaryYear` integer required
- `uploadedBy` string required 255
- `excelFileId` string required 255
- `logoFileId` string 255
- `sendEmail` boolean required
- `status` enum `processing`, `completed`, `failed`
- `totalEmployees` integer required
- `processedEmployees` integer required
- `failedEmployees` integer required
- `zipFileId` string 255
- `createdAt` datetime required
- `completedAt` datetime

Indexes:

- key: `salaryMonth`
- key: `salaryYear`

### email_logs

Attributes:

- `uploadId` string required 255
- `salaryRecordId` string required 255
- `employeeId` string required 100
- `email` email required
- `status` enum `pending`, `sent`, `failed`
- `error` string 2000
- `sentAt` datetime

Indexes:

- key: `uploadId`
- key: `status`

### generated_pdfs

Attributes:

- `uploadId` string required 255
- `salaryRecordId` string required 255
- `employeeId` string required 100
- `fileId` string required 255
- `fileName` string required 255
- `createdAt` datetime required

Indexes:

- key: `uploadId`
- key: `employeeId`

## Storage Buckets

### salary_uploads

Allowed extensions:

- `xlsx`
- `xls`
- `png`
- `jpg`
- `jpeg`
- `webp`

Maximum file size:

- 20 MB

### salary_pdfs

Allowed extensions:

- `pdf`
- `zip`

Maximum file size:

- 100 MB

## Email

Set SMTP variables in `.env.local`. For Resend, use its SMTP endpoint and API key as the SMTP password.

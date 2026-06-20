import { buckets } from "@/lib/env";
import { createAdminClient, getCurrentAdmin } from "@/lib/appwrite/server";

const enterprises= {
    "yogeshmamgain2611@gmail.com":{
        companyName: "Arpit Enterprises",
        companyAddress: "Shri ram colony, Nathuwala Dhang, Dehradun, Uttarakhand, India",
        companyPhone: "+91 9627287616",
       companyGST: "05CLAPP6359LIZO",
    }
    }


export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });
  const { fileId } = await params;
  const { storage } = createAdminClient();
  const [file, download] = await Promise.all([
    storage.getFile(buckets.pdfs, fileId),
    storage.getFileDownload(buckets.pdfs, fileId)
  ]);
  const body = download instanceof ArrayBuffer ? Buffer.from(download) : Buffer.from(download as unknown as Uint8Array);
  return new Response(body, {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name}"`
    }
  });
}

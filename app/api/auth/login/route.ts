import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    const clientWithSession = await import("node-appwrite").then(({ Account, Client }) => {
      const client = new Client()
        .setEndpoint(env.APPWRITE_ENDPOINT)
        .setProject(env.APPWRITE_PROJECT_ID)
        .setSession(session.secret);
      return new Account(client);
    });
    const user = await clientWithSession.get();
    console.log("Logged in user:", user);

    if (String(user.labels?.[0] ?? "") !== env.ADMIN_ROLE) {
      await account.deleteSession(session.$id).catch(() => undefined);
      return NextResponse.json({ error: "Only admin users can access this dashboard." }, { status: 403 });
    }

    const maxAge = env.SESSION_COOKIE_DAYS * 24 * 60 * 60;
    (await cookies()).set(env.SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge
    });

    return NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid email or password." },
      { status: 401 }
    );
  }
}

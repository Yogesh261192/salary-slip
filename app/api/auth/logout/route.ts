import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST() {
  (await cookies()).delete(env.SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}

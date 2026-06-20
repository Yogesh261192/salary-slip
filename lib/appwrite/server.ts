import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Users
} from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export { ID, Query };

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client)
  };
}

export async function createSessionClient() {
  const session = (await cookies()).get(env.SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setSession(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client)
  };
}

export async function getCurrentAdmin() {
  const client = await createSessionClient();
  if (!client) return null;

  try {
    const user = await client.account.get();
    return String(user.labels[0] ?? "") === env.ADMIN_ROLE ? user : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  return admin;
}

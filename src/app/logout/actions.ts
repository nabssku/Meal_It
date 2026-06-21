"use server";

import { signOut } from "@/lib/auth";

export async function performLogout(callbackUrl: string) {
  // This will clear the session cookies on the server and redirect
  await signOut({ redirectTo: callbackUrl });
}

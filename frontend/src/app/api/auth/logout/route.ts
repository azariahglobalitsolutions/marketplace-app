import { NextResponse } from "next/server";

import { clearServerAccessToken } from "@/lib/auth/session";

export async function POST() {
  await clearServerAccessToken();
  return NextResponse.json({ ok: true });
}

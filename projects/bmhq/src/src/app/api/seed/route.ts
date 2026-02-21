import { NextResponse } from "next/server";
import { seed } from "@/server/db/seed";
import { signAccessToken, signRefreshToken } from "@/server/auth/jwt";

export async function POST() {
  try {
    const { userId } = await seed();

    const accessToken = await signAccessToken(userId);
    const refreshToken = await signRefreshToken(userId);

    return NextResponse.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json(
      { error: "Seed failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateTokens } from "@/server/auth/jwt";
import { refreshSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { refreshToken } = parsed.data;

    let payload;
    try {
      payload = await verifyToken(refreshToken);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    const tokens = await generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

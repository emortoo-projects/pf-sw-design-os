import { NextRequest } from "next/server";
import { verifyToken, type TokenPayload } from "./jwt";

export async function authenticateRequest(request: NextRequest): Promise<TokenPayload> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  return verifyToken(token);
}

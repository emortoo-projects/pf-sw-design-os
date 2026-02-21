import { TRPCError } from "@trpc/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { users, refreshTokens } from "../../db/schema";
import { hashPassword, verifyPassword } from "../../auth/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../../auth/jwt";
import { router, publicProcedure } from "../init";

async function hashRefreshToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sanitizeUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const passwordHash = await hashPassword(input.password);

    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        name: input.name,
      })
      .returning();

    const accessToken = await signAccessToken(user.id);
    const refreshTokenValue = await signRefreshToken(user.id);

    const tokenHash = await hashRefreshToken(refreshTokenValue);
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const accessToken = await signAccessToken(user.id);
    const refreshTokenValue = await signRefreshToken(user.id);

    const tokenHash = await hashRefreshToken(refreshTokenValue);
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }),

  refresh: publicProcedure.input(refreshSchema).mutation(async ({ input }) => {
    let payload;
    try {
      payload = await verifyToken(input.refreshToken);
    } catch {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired refresh token",
      });
    }

    if (payload.type !== "refresh") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token type",
      });
    }

    const tokenHash = await hashRefreshToken(input.refreshToken);
    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt)
        )
      )
      .limit(1);

    if (!storedToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Refresh token has been revoked",
      });
    }

    // Revoke the old token
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    // Issue new token pair
    const accessToken = await signAccessToken(payload.sub);
    const newRefreshToken = await signRefreshToken(payload.sub);

    const newTokenHash = await hashRefreshToken(newRefreshToken);
    await db.insert(refreshTokens).values({
      userId: payload.sub,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }),

  logout: publicProcedure.input(logoutSchema).mutation(async ({ input }) => {
    const tokenHash = await hashRefreshToken(input.refreshToken);

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt)
        )
      );

    return { success: true };
  }),
});

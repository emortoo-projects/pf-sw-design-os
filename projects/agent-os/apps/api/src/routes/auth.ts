import { Router, Request, Response } from "express";
import { z } from "zod";
import * as jose from "jose";

const router = Router();

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "agent-os-dev-secret");
const JWT_ISSUER = "agent-os";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

const registerSchema = z.object({
  bmhqUserId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
});

const loginSchema = z.object({
  bmhqUserId: z.string().uuid(),
  email: z.string().email(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

async function generateTokens(userId: string, email: string) {
  const accessToken = await new jose.SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  const refreshToken = await new jose.SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return { accessToken, refreshToken };
}

// POST /auth/register - Register via BMHQ user identity
router.post("/register", async (req: Request, res: Response) => {
  try {
    const input = registerSchema.parse(req.body);

    // In production, this would verify the BMHQ token and create/find a user
    // For now, we generate tokens based on the provided BMHQ identity
    const { db } = req.app.locals;
    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const { users } = await import("@agent-os/database");

    const { eq } = await import("drizzle-orm");

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.bmhqUserId, input.bmhqUserId))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "User already registered" });
      return;
    }

    // Create new user
    const [user] = await db
      .insert(users)
      .values({
        bmhqUserId: input.bmhqUserId,
        email: input.email,
        name: input.name,
      })
      .returning();

    const tokens = await generateTokens(user.id, user.email);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /auth/login - Login via BMHQ user identity
router.post("/login", async (req: Request, res: Response) => {
  try {
    const input = loginSchema.parse(req.body);

    const { db } = req.app.locals;
    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const { users } = await import("@agent-os/database");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.bmhqUserId, input.bmhqUserId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const tokens = await generateTokens(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /auth/refresh - Refresh access token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const input = refreshSchema.parse(req.body);

    const { payload } = await jose.jwtVerify(input.refreshToken, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });

    if (payload.type !== "refresh") {
      res.status(401).json({ error: "Invalid token type" });
      return;
    }

    const userId = payload.sub as string;

    const { db } = req.app.locals;
    if (!db) {
      res.status(500).json({ error: "Database not configured" });
      return;
    }

    const { users } = await import("@agent-os/database");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const tokens = await generateTokens(user.id, user.email);

    res.json(tokens);
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      res.status(401).json({ error: "Refresh token expired" });
      return;
    }
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
      return;
    }
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /auth/logout - Logout (stateless - client discards tokens)
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;

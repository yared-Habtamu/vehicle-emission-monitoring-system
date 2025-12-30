import jwt from "jsonwebtoken";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: JWT_SECRET");
  } else {
    console.warn(
      "Warning: JWT_SECRET not set. Using insecure fallback for development."
    );
  }
}

const JWT_FALLBACK = JWT_SECRET || "dev-secret";

export function signToken(payload: object, opts = {}) {
  return jwt.sign(payload, JWT_FALLBACK, { expiresIn: "7d", ...opts });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_FALLBACK) as any;
  } catch (err) {
    return null;
  }
}

export async function getUserFromToken(token?: string) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || !decoded.sub) return null;
  const user = await prisma.user.findUnique({
    where: { id: String(decoded.sub) },
  });
  return user;
}

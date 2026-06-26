/**
 * Auth server functions — register, login, logout, getUser.
 * Semua operasi berjalan di server (Node), tidak terekspos ke browser.
 */
import { prisma } from "@/server/mysql/prisma";
import { hashPassword, verifyPassword } from "./password";
import { signToken, verifyToken } from "./jwt";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthResult =
  | { user: AuthUser; token: string; error?: never }
  | { user?: never; token?: never; error: string };

export async function registerUser(
  email: string,
  password: string,
  meta?: { username?: string; display_name?: string },
): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered" };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  // Buat profile otomatis saat register
  await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      username: meta?.username ?? null,
      displayName: meta?.display_name ?? meta?.username ?? null,
    },
    update: {},
  });

  const token = await signToken({ sub: user.id, email: user.email });
  return { user: { id: user.id, email: user.email }, token };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password" };

  const token = await signToken({ sub: user.id, email: user.email });
  return { user: { id: user.id, email: user.email }, token };
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = await verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

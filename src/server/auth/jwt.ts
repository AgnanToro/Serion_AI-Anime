/**
 * JWT helpers — sign & verify token pakai secret dari env.
 * Pakai library `jose` (pure ESM, jalan di edge/Node).
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env variable is not set");
  return new TextEncoder().encode(secret);
};

export type TokenPayload = JWTPayload & {
  sub: string;   // userId
  email: string;
};

/** Buat access token, expire 7 hari. */
export async function signToken(payload: Omit<TokenPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** Verifikasi dan decode token. Throw jika invalid/expired. */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as TokenPayload;
}

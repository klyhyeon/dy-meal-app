import { NextRequest } from "next/server";

export const AUTH_COOKIE = "meal_auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  return process.env.AUTH_SECRET || process.env.APP_PASSWORD || "dev-secret";
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function createAuthToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `v1.${issuedAt}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifyAuthToken(token?: string) {
  if (!token) return false;
  const [version, issuedAt, signature] = token.split(".");
  if (version !== "v1" || !issuedAt || !signature) return false;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;
  if (Math.floor(Date.now() / 1000) - issued > MAX_AGE_SECONDS) return false;
  return signature === (await sign(`${version}.${issuedAt}`));
}

export async function isAuthenticated(request: NextRequest) {
  return verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS
};

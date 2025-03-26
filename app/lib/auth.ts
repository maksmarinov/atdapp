import { compare, hash } from "bcrypt";

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

import { cache } from "react";
import * as jose from "jose";

const prisma = new PrismaClient();
interface JWTPayload {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const JWT_EXP = "7d";

const REFRESH_THRESHOLD = 60 * 60;

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPwd(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}

export async function createUser(
  email: string,
  password: string,
  username: string,
  name: string
) {
  const hashedPassword = await hashPassword(password);

  try {
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: username,
        name: name,
      },
    });
    return { username, email };
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}
export async function generateJWT(payload: JWTPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXP)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error("JWT verification unsuccessfull:", error);
    return null;
  }
}
export async function refreshToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      clockTolerance: 23,
    });
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    return exp - now < REFRESH_THRESHOLD;
  } catch {
    return false;
  }
}
export async function createSession(id: string) {
  try {
    const token = await generateJWT({ id });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });
    return true;
  } catch (error) {
    console.error("Error while creating session:", error);
    return false;
  }
}

export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;
    const payload = await verifyJWT(token);
    return payload ? { id: payload.id } : null;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("During prerendering, `cookies()` rejects")
    ) {
      console.log(
        "Cookies not available during prerendering, returning null session"
      );
      return null;
    }
    console.error("Error getting session:", error);
    return null;
  }
});

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

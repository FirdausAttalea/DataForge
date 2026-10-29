import * as argon2 from "@node-rs/argon2";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  if (hash.startsWith("$argon2")) {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
  if (hash.includes(".")) {
    try {
      const [hashedPassword, salt] = hash.split(".");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return timingSafeEqual(Buffer.from(hashedPassword, "hex"), buf);
    } catch {
      return false;
    }
  }
  return false;
}

export interface SessionContext {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    jobTitle?: string;
    organization?: string;
  } | null;
  workspace: {
    id: string;
    name: string;
    slug: string;
    setupCompleted: boolean;
  } | null;
  isAuthenticated: boolean;
}

export function getRedirectTarget(
  session: SessionContext,
  pathname: string
): string | null {
  const publicRoutes = ["/sign-up", "/sign-in", "/forgot-password", "/"];
  const authRoutes = ["/sign-up", "/sign-in", "/forgot-password"];

  if (!session.isAuthenticated) {
    if (publicRoutes.includes(pathname)) {
      return null;
    }
    return `/sign-in?next=${encodeURIComponent(pathname)}`;
  }

  if (authRoutes.includes(pathname)) {
    if (session.workspace?.setupCompleted) {
      return "/dashboard";
    }
    return "/workspace-setup";
  }

  if (pathname === "/workspace-setup") {
    if (session.workspace?.setupCompleted) {
      return "/dashboard";
    }
    return null;
  }

  if (!session.workspace?.setupCompleted && pathname !== "/workspace-setup") {
    return "/workspace-setup";
  }

  return null;
}

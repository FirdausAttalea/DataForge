import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashedPassword, salt] = hash.split(".");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hashedPassword, "hex"), buf);
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

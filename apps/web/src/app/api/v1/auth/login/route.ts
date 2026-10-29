import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getWorkspacesByOwner } from "@/lib/store";
import { verifyPassword } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email and password required" } },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(body.email);
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const workspaces = await getWorkspacesByOwner(user.id);
    const hasCompletedSetup = workspaces.some((w) => w.setupCompleted);

    const response = NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      hasCompletedSetup,
    });

    response.cookies.set("df_setup_complete", hasCompletedSetup ? "true" : "false", {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    response.cookies.set("df_session", `${user.id}.${Date.now()}`, {
      httpOnly: true,
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

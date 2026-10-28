import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/store";
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

    const response = NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("df_session", `${user.id}.${Date.now()}`, {
      httpOnly: true,
      path: "/",
      maxAge: 31536000,
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

import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/store";
import { hashPassword } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(body.email);
    if (existing) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "Email already registered" } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(body.password);
    const user = await createUser({
      id: `user-${Date.now()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      passwordHash,
      role: body.role,
    });

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
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { provisionWorkspace } from "@/lib/store/provision";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("df_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value.split(".")[0];
    const body = await request.json();

    if (!body.name || !body.slug || !body.primaryGoal || !body.experienceLevel) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    const result = await provisionWorkspace(userId, {
      name: body.name,
      slug: body.slug,
      primaryGoal: body.primaryGoal,
      experienceLevel: body.experienceLevel,
      createStarterProject: body.createStarterProject || false,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create workspace";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

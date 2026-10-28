import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required fields: name, slug" } },
        { status: 400 }
      );
    }

    const workspace = {
      id: `ws-${Date.now()}`,
      name: body.name,
      slug: body.slug,
      engine: body.engine || "duckdb",
      datasets: body.datasets || [],
      created_at: new Date().toISOString(),
      setup_completed: true,
    };

    return NextResponse.json(workspace);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Could not create workspace." } },
      { status: 500 }
    );
  }
}

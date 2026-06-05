import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ref = request.nextUrl.searchParams.get("r");

  if (ref) {
    const cookieStore = cookies();
    cookieStore.set("dm_ref", ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  const destination = new URL(`/session/${params.id}`, request.url);
  destination.searchParams.set("utm_source", "share_card");
  destination.searchParams.set("utm_medium", "social");

  return NextResponse.redirect(destination, 302);
}

import { NextResponse, type NextRequest } from "next/server";

import { getSearchSuggestions } from "@/lib/api/endpoints";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  try {
    const result = await getSearchSuggestions(q);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { products: [], categories: [] },
      { status: 502 },
    );
  }
}

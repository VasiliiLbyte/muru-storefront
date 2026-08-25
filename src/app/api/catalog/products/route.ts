import { NextResponse, type NextRequest } from "next/server";

import { getProducts, searchProducts } from "@/lib/api/endpoints";
import { ProductListQuerySchema } from "@/lib/schemas";

/**
 * Public catalog list BFF for client «Показать ещё».
 * - With `q` → searchProducts
 * - Else → getProducts (ProductListQuerySchema)
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";

  try {
    if (q.length > 0) {
      const page = Number(sp.get("page")) || 1;
      const pageSizeRaw = Number(sp.get("pageSize"));
      const pageSize =
        Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? pageSizeRaw : 24;
      const result = await searchProducts({ q, page, pageSize });
      return NextResponse.json({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    }

    const raw: Record<string, string> = {};
    sp.forEach((value, key) => {
      if (key === "q") return;
      raw[key] = value;
    });
    const parsed = ProductListQuerySchema.parse(raw);
    const result = await getProducts(parsed);
    return NextResponse.json({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch {
    return NextResponse.json(
      { items: [], total: 0, page: 1, pageSize: 24 },
      { status: 502 },
    );
  }
}

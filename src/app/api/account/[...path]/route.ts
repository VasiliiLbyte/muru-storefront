import { NextResponse } from "next/server";

import {
  readRefreshCookie,
  serializeClearRefreshCookie,
  serializeRefreshCookie,
} from "@/lib/account/bff-cookies";
import {
  buildUpstreamAccountUrl,
  buildUpstreamHeaders,
  proxyToUpstream,
} from "@/lib/account/bff-proxy";
import { extractAndStripRefreshToken } from "@/lib/account/bff-tokens";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const TOKEN_PATHS = new Set(["login", "refresh"]);

async function handleAccountProxy(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { path: pathSegments = [] } = await context.params;
  const pathKey = pathSegments.join("/");
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  let bodyText: string | null = null;
  if (method !== "GET" && method !== "HEAD") {
    bodyText = await request.text();
  }

  const cookieHeader = request.headers.get("cookie");
  const refreshFromCookie = readRefreshCookie(cookieHeader);

  // refresh: inject cookie RT into JSON body
  if (pathKey === "refresh" && method === "POST") {
    if (!refreshFromCookie) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { message: "No refresh session", code: "UNAUTHORIZED" },
        },
        { status: 401 },
      );
    }
    bodyText = JSON.stringify({ refreshToken: refreshFromCookie });
  }

  // logout: ensure body has refreshToken from cookie
  if (pathKey === "logout" && method === "POST") {
    let parsed: Record<string, unknown> = {};
    if (bodyText) {
      try {
        parsed = JSON.parse(bodyText) as Record<string, unknown>;
      } catch {
        parsed = {};
      }
    }
    if (
      typeof parsed.refreshToken !== "string" &&
      refreshFromCookie
    ) {
      parsed.refreshToken = refreshFromCookie;
    }
    if (typeof parsed.refreshToken !== "string") {
      const cleared = NextResponse.json(
        {
          success: true,
          data: { ok: true },
          error: null,
        },
        { status: 200 },
      );
      cleared.headers.append(
        "Set-Cookie",
        serializeClearRefreshCookie(),
      );
      return cleared;
    }
    bodyText = JSON.stringify(parsed);
  }

  const isLogout = pathKey === "logout" && method === "POST";

  let upstreamUrl: string;
  try {
    upstreamUrl = buildUpstreamAccountUrl(pathSegments, url.search);
  } catch {
    const res = NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "Account API is not configured",
          code: "UPSTREAM",
        },
      },
      { status: 503 },
    );
    if (isLogout) {
      res.headers.append("Set-Cookie", serializeClearRefreshCookie());
    }
    return res;
  }

  const hasBody = bodyText !== null && bodyText.length > 0;
  const headers = buildUpstreamHeaders(request, { hasBody });

  let upstream: Response;
  try {
    upstream = await proxyToUpstream(upstreamUrl, {
      method,
      headers,
      body: hasBody ? bodyText : null,
    });
  } catch {
    const res = NextResponse.json(
      {
        success: false,
        data: null,
        error: { message: "Upstream unreachable", code: "UPSTREAM" },
      },
      { status: 502 },
    );
    if (isLogout) {
      res.headers.append("Set-Cookie", serializeClearRefreshCookie());
    }
    return res;
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    const text = await upstream.text();
    const res = new NextResponse(text, { status: upstream.status });
    if (pathKey === "logout") {
      res.headers.append("Set-Cookie", serializeClearRefreshCookie());
    }
    return res;
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    const res = NextResponse.json(
      {
        success: false,
        data: null,
        error: { message: "Invalid upstream JSON", code: "UPSTREAM" },
      },
      { status: 502 },
    );
    if (isLogout) {
      res.headers.append("Set-Cookie", serializeClearRefreshCookie());
    }
    return res;
  }

  const shouldHandleTokens =
    TOKEN_PATHS.has(pathSegments[0] ?? "") &&
    method === "POST" &&
    upstream.ok;

  let responseBody = payload;
  let setCookie: string | null = null;

  if (shouldHandleTokens) {
    const { body, refreshToken } = extractAndStripRefreshToken(payload);
    responseBody = body;
    if (refreshToken) {
      setCookie = serializeRefreshCookie({ value: refreshToken });
    }
  }

  const res = NextResponse.json(responseBody, { status: upstream.status });

  if (setCookie) {
    res.headers.append("Set-Cookie", setCookie);
  }

  if (pathKey === "logout") {
    res.headers.append("Set-Cookie", serializeClearRefreshCookie());
  }

  return res;
}

export async function GET(request: Request, context: RouteContext) {
  return handleAccountProxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleAccountProxy(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleAccountProxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAccountProxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleAccountProxy(request, context);
}

/**
 * Strip refreshToken from envelope data and return cookie value if present.
 */
export function extractAndStripRefreshToken(payload: unknown): {
  body: unknown;
  refreshToken: string | null;
} {
  if (!payload || typeof payload !== "object") {
    return { body: payload, refreshToken: null };
  }

  const envelope = payload as {
    success?: boolean;
    data?: unknown;
    error?: unknown;
  };

  if (!envelope.data || typeof envelope.data !== "object") {
    return { body: payload, refreshToken: null };
  }

  const data = { ...(envelope.data as Record<string, unknown>) };
  const refreshToken =
    typeof data.refreshToken === "string" ? data.refreshToken : null;
  if ("refreshToken" in data) {
    delete data.refreshToken;
  }

  return {
    body: { ...envelope, data },
    refreshToken,
  };
}

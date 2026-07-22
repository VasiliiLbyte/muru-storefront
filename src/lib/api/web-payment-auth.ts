/**
 * RequestInit for POST /payments/web/create.
 * Bearer only when customer access token is present (guest otherwise).
 */
export function buildWebPaymentRequestInit(
  bodyJson: string,
  accessToken: string | null,
): RequestInit {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return {
    method: "POST",
    body: bodyJson,
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  };
}

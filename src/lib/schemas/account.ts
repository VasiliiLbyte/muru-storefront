import { z } from "zod";

export const CUSTOMER_PASSWORD_MIN = 8;

export const CustomerSchema = z.object({
  id: z.number(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  consentAccepted: z.boolean().optional(),
  consentVersion: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  lastLoginAt: z.string().nullable().optional(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().optional(),
  customer: CustomerSchema.optional(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const AddressSchema = z.object({
  id: z.number(),
  label: z.string(),
  city: z.string(),
  cdekCityCode: z.number().nullable().optional(),
  address: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string().optional(),
});
export type AccountAddress = z.infer<typeof AddressSchema>;

export const CustomerOrderSummarySchema = z.object({
  id: z.number(),
  status: z.string(),
  total: z.number(),
  channel: z.string().optional(),
  createdAt: z.string(),
  paidAt: z.string().nullable().optional(),
});
export type CustomerOrderSummary = z.infer<typeof CustomerOrderSummarySchema>;

export const AccountFavoriteSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().optional(),
  inStock: z.number().optional(),
});
export type AccountFavorite = z.infer<typeof AccountFavoriteSchema>;

/** CRM fulfillment statuses (without Черновик for progress UI). */
export const ACCOUNT_ORDER_STATUSES = [
  "Новый",
  "В обработке",
  "Подтверждён",
  "Собирается",
  "Передан в доставку",
  "Доставлен",
  "Отменён",
  "Возврат",
] as const;

const DONE_STATUSES = new Set(["Доставлен", "Отменён", "Возврат", "Черновик"]);

export function isActiveOrderStatus(status: string): boolean {
  return !DONE_STATUSES.has(status);
}

export function orderStatusProgress(status: string): {
  step: number;
  total: number;
} {
  const flow = [
    "Новый",
    "В обработке",
    "Подтверждён",
    "Собирается",
    "Передан в доставку",
    "Доставлен",
  ];
  const idx = flow.indexOf(status);
  return {
    step: idx >= 0 ? idx + 1 : 0,
    total: flow.length,
  };
}

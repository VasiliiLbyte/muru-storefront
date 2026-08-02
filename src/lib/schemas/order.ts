import { z } from "zod";

/** Позиция гостевого веб-чекаута. */
export const WebCheckoutItemSchema = z.object({
  sku: z.string(),
  quantity: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
});
export type WebCheckoutItem = z.infer<typeof WebCheckoutItemSchema>;

/** Тело POST /payments/web/create. */
export const WebCheckoutSchema = z.object({
  items: z.array(WebCheckoutItemSchema).min(1),
  deliveryMode: z.enum(["delivery", "pickup"]),
  deliveryOption: z.string().nullable(),
  deliveryEta: z.string().nullable(),
  address: z.string(),
  comment: z.string(),
  birthDate: z.string().nullable(),
  recipientName: z.string().min(2),
  recipientPhone: z.string().min(10),
  email: z.string().trim().email(),
  cdekTariffCode: z.number().nullable(),
  cdekCityCode: z.number().nullable(),
  cdekCityName: z.string().nullable(),
  cdekPvzCode: z.string().nullable(),
  cdekPvzAddress: z.string().nullable(),
});
export type WebCheckoutInput = z.infer<typeof WebCheckoutSchema>;

/** Ответ POST /payments/web/create. */
export const WebPaymentCreateResponseSchema = z.object({
  paymentId: z.string(),
  confirmationUrl: z.string(),
});
export type WebPaymentCreateResponse = z.infer<
  typeof WebPaymentCreateResponseSchema
>;

/** Сводка заказа в ответе статуса веб-платежа (succeeded). */
export const WebPaymentOrderSummarySchema = z.object({
  id: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
      color: z.string().nullish(),
      size: z.string().nullish(),
    }),
  ),
  subtotal: z.number(),
  deliveryPrice: z.number(),
  total: z.number(),
  deliveryMode: z.string(),
  deliveryOption: z.string().nullish(),
  cdekPvzAddress: z.string().nullish(),
  address: z.string().nullish(),
  recipientName: z.string().nullish(),
  deliveryEta: z.string().nullish(),
});
export type WebPaymentOrderSummary = z.infer<typeof WebPaymentOrderSummarySchema>;

/** Ответ GET /payments/web/:paymentId/status. */
export const WebPaymentStatusResponseSchema = z.object({
  status: z.string(),
  orderId: z.number().nullable(),
  order: WebPaymentOrderSummarySchema.optional(),
});
export type WebPaymentStatusResponse = z.infer<
  typeof WebPaymentStatusResponseSchema
>;

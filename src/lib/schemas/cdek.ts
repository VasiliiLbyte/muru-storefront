import { z } from "zod";

export const CdekCitySchema = z.object({
  code: z.number(),
  full_name: z.string(),
  city: z.string(),
  region: z.string(),
});
export type CdekCity = z.infer<typeof CdekCitySchema>;

export const AddressSuggestionSchema = z.object({
  value: z.string(),
  street: z.string().optional(),
  house: z.string().optional(),
  block: z.string().optional(),
  flat: z.string().optional(),
  postalCode: z.string().optional(),
  cityFiasId: z.string().optional(),
});
export type AddressSuggestion = z.infer<typeof AddressSuggestionSchema>;

export const CdekPvzSchema = z.object({
  code: z.string(),
  name: z.string(),
  address: z.string(),
  workTime: z.string(),
  phones: z.array(z.string()),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  weightMax: z.number().optional(),
  note: z.string().optional(),
});
export type CdekPvz = z.infer<typeof CdekPvzSchema>;

export const CdekTariffOptionSchema = z
  .object({
    tariffCode: z.number(),
    deliverySum: z.number(),
    periodMin: z.number(),
    periodMax: z.number(),
  })
  .nullable();
export type CdekTariffOption = z.infer<typeof CdekTariffOptionSchema>;

export const CdekCalcResultSchema = z.object({
  door: CdekTariffOptionSchema,
  pvz: CdekTariffOptionSchema,
  errors: z.array(z.string()),
});
export type CdekCalcResult = z.infer<typeof CdekCalcResultSchema>;

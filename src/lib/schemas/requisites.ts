import { z } from "zod";

/** Публичный DTO из GET /api/content/requisites (BE PublicRequisites). */
export const PublicRequisitesSchema = z.object({
  reqFullName: z.string().nullable(),
  reqShortName: z.string().nullable(),
  reqInn: z.string().nullable(),
  reqOgrnip: z.string().nullable(),
  reqLegalAddress: z.string().nullable(),
  reqActualAddress: z.string().nullable(),
  reqPhone: z.string().nullable(),
  reqEmail: z.string().nullable(),
  reqSite: z.string().nullable(),
  reqBankDetails: z.string().nullable(),
});
export type PublicRequisites = z.infer<typeof PublicRequisitesSchema>;

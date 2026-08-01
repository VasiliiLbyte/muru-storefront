import { z } from "zod";

/** Публичный DTO из GET /api/content/site-contacts (BE PublicSiteContacts). */
export const PublicSiteContactsSchema = z.object({
  contactPhoneDisplay: z.string().nullable(),
  contactPhoneHref: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactAddress: z.string().nullable(),
  contactHours: z.string().nullable(),
  contactMapLat: z.number().nullable(),
  contactMapLng: z.number().nullable(),
  contactMapZoom: z.number().nullable(),
  socialTelegram: z.string().nullable(),
  socialWhatsapp: z.string().nullable(),
  socialVk: z.string().nullable(),
});
export type PublicSiteContacts = z.infer<typeof PublicSiteContactsSchema>;

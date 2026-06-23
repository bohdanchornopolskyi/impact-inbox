import { z } from "zod";

export const physicalAddressFieldsSchema = z.object({
  streetLine1: z.string().max(255),
  streetLine2: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  postalCode: z.string().max(20),
  country: z.string().max(100),
});

export const physicalAddressSchema = physicalAddressFieldsSchema.nullable();

export type PhysicalAddressFields = z.infer<typeof physicalAddressFieldsSchema>;
export type PhysicalAddressData = z.infer<typeof physicalAddressSchema>;

export const EMPTY_PHYSICAL_ADDRESS_FIELDS: PhysicalAddressFields = {
  streetLine1: "",
  streetLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function physicalAddressFromData(
  data: PhysicalAddressData | null | undefined,
): PhysicalAddressFields {
  if (!data) {
    return { ...EMPTY_PHYSICAL_ADDRESS_FIELDS };
  }

  return {
    streetLine1: data.streetLine1,
    streetLine2: data.streetLine2,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
  };
}

export function normalizePhysicalAddress(
  fields: PhysicalAddressFields,
): PhysicalAddressData {
  const normalized: PhysicalAddressFields = {
    streetLine1: fields.streetLine1.trim(),
    streetLine2: fields.streetLine2.trim(),
    city: fields.city.trim(),
    state: fields.state.trim(),
    postalCode: fields.postalCode.trim(),
    country: fields.country.trim(),
  };

  const hasValue = Object.values(normalized).some(Boolean);
  if (!hasValue) {
    return null;
  }

  return normalized;
}

export function formatPhysicalAddress(
  address: PhysicalAddressData | null | undefined,
): string {
  if (!address) {
    return "";
  }

  const lines: string[] = [];

  if (address.streetLine1) {
    lines.push(address.streetLine1);
  }
  if (address.streetLine2) {
    lines.push(address.streetLine2);
  }

  const cityLine = [
    address.city,
    [address.state, address.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  if (cityLine) {
    lines.push(cityLine);
  }
  if (address.country) {
    lines.push(address.country);
  }

  return lines.join("\n");
}

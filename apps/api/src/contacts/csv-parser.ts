import { parse } from "csv-parse/sync";

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsvBuffer(buffer: Buffer): ParsedCsv {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  const headers =
    records.length > 0
      ? Object.keys(records[0]!)
      : parse(buffer, { columns: false, bom: true })[0]?.map(String) ?? [];

  return { headers, rows: records };
}

export function suggestColumnMapping(headers: string[]): {
  email?: string;
  firstName?: string;
  lastName?: string;
} {
  const normalized = headers.map((header) => ({
    header,
    key: header.toLowerCase().replace(/[^a-z0-9]/g, ""),
  }));

  const find = (...candidates: string[]) =>
    normalized.find((entry) => candidates.includes(entry.key))?.header;

  return {
    email: find("email", "emailaddress", "e mail"),
    firstName: find("firstname", "first", "fname", "givenname"),
    lastName: find("lastname", "last", "lname", "surname", "familyname"),
  };
}

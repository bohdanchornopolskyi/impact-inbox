import { describe, expect, it } from "vitest";
import { workspaceGeneralFormSchema } from "./workspace";

const validValues = {
  name: "Acme",
  slug: "acme",
  streetLine1: "123 Main St",
  streetLine2: "",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "USA",
};

describe("workspaceGeneralFormSchema", () => {
  it("accepts valid values", () => {
    expect(workspaceGeneralFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("trims name and slug", () => {
    const result = workspaceGeneralFormSchema.parse({
      ...validValues,
      name: " Acme ",
      slug: " acme ",
    });

    expect(result.name).toBe("Acme");
    expect(result.slug).toBe("acme");
  });

  it("reports a message for an invalid slug", () => {
    const result = workspaceGeneralFormSchema.safeParse({
      ...validValues,
      slug: "Not A Slug",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Use lowercase letters, numbers and single hyphens",
    );
  });

  it("requires a name", () => {
    const result = workspaceGeneralFormSchema.safeParse({
      ...validValues,
      name: "  ",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a workspace name");
  });
});

import { describe, expect, it } from "vitest";
import {
  contactNameUpdate,
  resolveContactNameFields,
} from "./contact-name-draft";

describe("resolveContactNameFields", () => {
  it("shows server names until the user edits", () => {
    expect(
      resolveContactNameFields(
        { firstName: "Ada", lastName: null },
        null,
      ),
    ).toEqual({ firstName: "Ada", lastName: "" });
  });

  it("keeps the draft when the server contact changes", () => {
    const draft = { firstName: "Augusta", lastName: "King" };

    expect(
      resolveContactNameFields(
        { firstName: "Ada", lastName: "Lovelace" },
        draft,
      ),
    ).toEqual(draft);
  });
});

describe("contactNameUpdate", () => {
  it("trims names and sends null for empty fields", () => {
    expect(
      contactNameUpdate({ firstName: "  Ada  ", lastName: "   " }),
    ).toEqual({ firstName: "Ada", lastName: null });
  });
});

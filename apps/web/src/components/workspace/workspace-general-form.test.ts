import { describe, expect, it } from "vitest";
import {
  type WorkspaceDetailData,
  type WorkspaceGeneralFormValues,
} from "@repo/shared";
import {
  areGeneralValuesEqual,
  buildGeneralUpdate,
  countDirtyFields,
  generalFormValues,
  generalSaveStatus,
  savedGeneralValues,
} from "./workspace-general-form";

const address = {
  streetLine1: "123 Main St",
  streetLine2: "",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "USA",
};

function workspaceWith(
  overrides: Partial<Pick<WorkspaceDetailData, "name" | "slug" | "physicalAddress">> = {},
) {
  return {
    name: "Acme",
    slug: "acme",
    physicalAddress: address,
    ...overrides,
  } as WorkspaceDetailData;
}

function valuesWith(
  overrides: Partial<WorkspaceGeneralFormValues> = {},
): WorkspaceGeneralFormValues {
  return { ...generalFormValues(workspaceWith()), ...overrides };
}

describe("buildGeneralUpdate", () => {
  it("returns null when nothing changed", () => {
    expect(buildGeneralUpdate(workspaceWith(), valuesWith())).toBeNull();
  });

  it("ignores surrounding whitespace", () => {
    expect(
      buildGeneralUpdate(
        workspaceWith(),
        valuesWith({ name: "  Acme ", city: " Austin " }),
      ),
    ).toBeNull();
  });

  it("does not depend on the key order of the saved address", () => {
    const reordered = {
      country: "USA",
      postalCode: "78701",
      state: "TX",
      city: "Austin",
      streetLine2: "",
      streetLine1: "123 Main St",
    };

    expect(
      buildGeneralUpdate(
        workspaceWith({ physicalAddress: reordered }),
        valuesWith(),
      ),
    ).toBeNull();
  });

  it("sends only the changed fields", () => {
    expect(
      buildGeneralUpdate(workspaceWith(), valuesWith({ name: "Acme Inc" })),
    ).toEqual({ name: "Acme Inc" });
    expect(
      buildGeneralUpdate(workspaceWith(), valuesWith({ city: "Dallas" })),
    ).toEqual({ physicalAddress: { ...address, city: "Dallas" } });
  });

  it("sends a null address when every address field is cleared", () => {
    const cleared = valuesWith({
      streetLine1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });

    expect(buildGeneralUpdate(workspaceWith(), cleared)).toEqual({
      physicalAddress: null,
    });
  });

  it("treats an empty form as unchanged when no address is saved", () => {
    const empty = valuesWith({
      streetLine1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });

    expect(
      buildGeneralUpdate(workspaceWith({ physicalAddress: null }), empty),
    ).toBeNull();
  });
});

describe("savedGeneralValues", () => {
  it("trims every field", () => {
    expect(
      savedGeneralValues(valuesWith({ name: " Acme ", slug: " acme ", city: " Austin " })),
    ).toEqual(valuesWith());
  });
});

describe("areGeneralValuesEqual", () => {
  it("compares every field", () => {
    expect(areGeneralValuesEqual(valuesWith(), valuesWith())).toBe(true);
    expect(
      areGeneralValuesEqual(valuesWith(), valuesWith({ country: "Canada" })),
    ).toBe(false);
  });
});

describe("countDirtyFields", () => {
  it("counts only dirty fields", () => {
    expect(countDirtyFields({})).toBe(0);
    expect(countDirtyFields({ name: true, slug: false, city: true })).toBe(2);
  });
});

describe("generalSaveStatus", () => {
  it("reports saving first", () => {
    expect(
      generalSaveStatus({ isSaving: true, hasErrors: true, dirtyCount: 2 }),
    ).toEqual({ tone: "saving", label: "Saving" });
  });

  it("reports errors over unsaved changes", () => {
    expect(
      generalSaveStatus({ isSaving: false, hasErrors: true, dirtyCount: 1 }).tone,
    ).toBe("error");
  });

  it("reports the unsaved count", () => {
    expect(
      generalSaveStatus({ isSaving: false, hasErrors: false, dirtyCount: 1 }),
    ).toEqual({ tone: "unsaved", label: "1 unsaved change" });
    expect(
      generalSaveStatus({ isSaving: false, hasErrors: false, dirtyCount: 3 }),
    ).toEqual({ tone: "unsaved", label: "3 unsaved changes" });
    expect(
      generalSaveStatus({ isSaving: false, hasErrors: false, dirtyCount: 0 }),
    ).toEqual({ tone: "saved", label: "No unsaved changes" });
  });
});

import { describe, expect, it } from "vitest";
import { isPreviewHtmlReady } from "./preview-sync";

describe("isPreviewHtmlReady", () => {
  it("waits until debounce, fetch, and html are ready", () => {
    const hash = '{"version":1}';

    expect(
      isPreviewHtmlReady({
        contentHash: hash,
        debouncedHash: "old",
        isFetching: false,
        html: "<html></html>",
      }),
    ).toBe(false);

    expect(
      isPreviewHtmlReady({
        contentHash: hash,
        debouncedHash: hash,
        isFetching: true,
        html: "<html>stale</html>",
      }),
    ).toBe(false);

    expect(
      isPreviewHtmlReady({
        contentHash: hash,
        debouncedHash: hash,
        isFetching: false,
        html: "",
      }),
    ).toBe(false);

    expect(
      isPreviewHtmlReady({
        contentHash: hash,
        debouncedHash: hash,
        isFetching: false,
        html: "<html>fresh</html>",
      }),
    ).toBe(true);
  });
});

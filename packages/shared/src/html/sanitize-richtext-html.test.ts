import { describe, expect, it } from "vitest";
import { sanitizeRichtextHtml } from "./sanitize-richtext-html";

describe("sanitizeRichtextHtml", () => {
  it("preserves allowed formatting tags", () => {
    expect(sanitizeRichtextHtml("<p>Rich <strong>text</strong></p>")).toBe(
      "<p>Rich <strong>text</strong></p>",
    );
  });

  it("preserves merge tags in text", () => {
    expect(
      sanitizeRichtextHtml("<p>Hi {{firstName}}, welcome to {{workspaceName}}</p>"),
    ).toBe("<p>Hi {{firstName}}, welcome to {{workspaceName}}</p>");
  });

  it("preserves heading tags", () => {
    expect(sanitizeRichtextHtml("<h2>Title</h2>")).toBe("<h2>Title</h2>");
  });

  it("strips script tags and event handlers", () => {
    expect(
      sanitizeRichtextHtml(
        '<p onclick="alert(1)">Hi</p><script>alert(1)</script>',
      ),
    ).toBe("<p>Hi</p>");
  });

  it("allows safe links", () => {
    expect(
      sanitizeRichtextHtml(
        '<p><a href="https://example.com">Link</a></p>',
      ),
    ).toBe('<p><a href="https://example.com">Link</a></p>');
  });

  it("removes javascript links", () => {
    expect(
      sanitizeRichtextHtml('<p><a href="javascript:alert(1)">Bad</a></p>'),
    ).toBe("<p><a>Bad</a></p>");
  });
});

import { describe, expect, it } from "vitest";
import { sanitizeRichtextHtml } from "./sanitize-richtext-html";

describe("sanitizeRichtextHtml", () => {
  it("preserves allowed formatting tags and resets paragraph margin", () => {
    expect(sanitizeRichtextHtml("<p>Rich <strong>text</strong></p>")).toBe(
      '<p style="margin:0">Rich <strong>text</strong></p>',
    );
  });

  it("preserves merge tags in text", () => {
    expect(
      sanitizeRichtextHtml("<p>Hi {{firstName}}, welcome to {{workspaceName}}</p>"),
    ).toBe('<p style="margin:0">Hi {{firstName}}, welcome to {{workspaceName}}</p>');
  });

  it("preserves heading tags with default inline styles", () => {
    expect(sanitizeRichtextHtml("<h2>Title</h2>")).toBe(
      '<h2 style="font-size:24px;font-weight:700;margin:0">Title</h2>',
    );
  });

  it("resets list margins", () => {
    expect(sanitizeRichtextHtml("<ul><li>One</li></ul>")).toBe(
      '<ul style="margin:0"><li>One</li></ul>',
    );
  });

  it("strips script tags and event handlers", () => {
    expect(
      sanitizeRichtextHtml(
        '<p onclick="alert(1)">Hi</p><script>alert(1)</script>',
      ),
    ).toBe('<p style="margin:0">Hi</p>');
  });

  it("allows safe links", () => {
    expect(
      sanitizeRichtextHtml(
        '<p><a href="https://example.com">Link</a></p>',
      ),
    ).toBe('<p style="margin:0"><a href="https://example.com">Link</a></p>');
  });

  it("removes javascript links", () => {
    expect(
      sanitizeRichtextHtml('<p><a href="javascript:alert(1)">Bad</a></p>'),
    ).toBe('<p style="margin:0"><a>Bad</a></p>');
  });
});

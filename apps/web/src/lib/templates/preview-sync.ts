export function isPreviewHtmlReady(options: {
  contentHash: string;
  debouncedHash: string;
  isFetching: boolean;
  html: string;
}): boolean {
  return (
    options.contentHash === options.debouncedHash &&
    !options.isFetching &&
    options.html.length > 0
  );
}

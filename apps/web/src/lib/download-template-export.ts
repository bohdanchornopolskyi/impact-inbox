import { strToU8, zipSync } from "fflate";

type ZipEntry = {
  path: string;
  content: string;
};

export function createTemplateExportZip(entries: ZipEntry[]): Blob {
  const files: Record<string, Uint8Array> = {};

  for (const entry of entries) {
    files[entry.path] = strToU8(entry.content);
  }

  const archive = zipSync(files);

  return new Blob([archive], {
    type: "application/zip",
  });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadTemplateExportBundle(
  html: string,
  text: string,
  htmlFileName: string,
) {
  const textFileName = htmlFileName.replace(/\.html$/i, ".txt");
  const zipFileName = htmlFileName.replace(/\.html$/i, ".zip");
  const zip = createTemplateExportZip([
    { path: htmlFileName, content: html },
    { path: textFileName, content: text },
  ]);
  downloadBlob(zip, zipFileName);
}

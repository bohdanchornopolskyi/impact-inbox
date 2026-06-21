"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button, Modal, Tabs } from "@repo/ui/client";
import { useExportTemplate } from "@/lib/templates/template-hooks";
import { downloadTemplateExportBundle } from "@/lib/download-template-export";
import { useToast } from "@/components/ui/toast";
import { useBuilder, useBuilderFlush } from "../builder-provider";

export function ExportTemplateModal() {
  const templateId = useBuilder((s) => s.templateId);
  const exportOpen = useBuilder((s) => s.exportOpen);
  const setExportOpen = useBuilder((s) => s.setExportOpen);
  const flush = useBuilderFlush();
  const { mutateAsync: exportTemplateAsync, isPending } =
    useExportTemplate(templateId);
  const { showError, showToast } = useToast();
  const [tab, setTab] = useState<"html" | "text">("html");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("template.html");
  const fetchedForOpenRef = useRef(false);

  useEffect(() => {
    if (!exportOpen) {
      fetchedForOpenRef.current = false;
      return;
    }

    if (fetchedForOpenRef.current) {
      return;
    }

    fetchedForOpenRef.current = true;

    void flush().then((saved) => {
      if (!saved) {
        showError("Could not sync working copy before export");
        return;
      }

      return exportTemplateAsync();
    })
      .then((result) => {
        if (!result) {
          return;
        }

        setHtml(result.html);
        setText(result.text);
        setFileName(result.fileName);
      })
      .catch((error) => {
        showError(
          error instanceof Error ? error.message : "Export failed",
        );
      });
  }, [exportTemplateAsync, flush, showError, exportOpen]);

  async function copyCurrent() {
    const value = tab === "html" ? html : text;

    try {
      await navigator.clipboard.writeText(value);
      showToast("Copied to clipboard");
    } catch {
      showError("Could not copy to clipboard");
    }
  }

  function downloadBundle() {
    if (!html && !text) {
      return;
    }

    downloadTemplateExportBundle(html, text, fileName);
  }

  return (
    <Modal
      open={exportOpen}
      onOpenChange={(open) => setExportOpen(open)}
      title="Export template"
      description="Download HTML and plain text together."
      className="max-w-2xl"
      footer={
        <>
          <Button
            variant="secondary"
            leftIcon={<Copy className="size-4" strokeWidth={1.5} />}
            onClick={() => copyCurrent()}
          >
            Copy
          </Button>
          <Button
            variant="primary"
            disabled={isPending || (!html && !text)}
            leftIcon={<Download className="size-4" strokeWidth={1.5} />}
            onClick={() => downloadBundle()}
          >
            Download
          </Button>
        </>
      }
    >
      <Tabs
        tabs={[
          { value: "html", label: "HTML" },
          { value: "text", label: "Plain text" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "html" | "text")}
      >
        {isPending ? (
          <p className="text-ui-sm text-text-secondary">Generating export...</p>
        ) : (
          <textarea
            readOnly
            value={tab === "html" ? html : text}
            className="min-h-72 w-full rounded-md border border-border-strong bg-surface-muted px-3 py-2 font-mono text-ui-xs text-text-primary outline-none"
          />
        )}
      </Tabs>
    </Modal>
  );
}

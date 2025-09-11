"use client";

import { useMemo, useCallback } from "react";
import { useBuilder } from "@/app/build/BuilderContext";
import {
  AnyBlock,
  BlockStyles,
  ButtonBlockType,
  ImageBlockType,
  TextBlockType,
} from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STYLE_FIELDS } from "@/lib/constants";

function useSelectedBlock(blocks: AnyBlock[], selectedId: string) {
  return useMemo(
    () => blocks.find((b) => b.id === selectedId),
    [blocks, selectedId],
  );
}

export default function RightSidebar() {
  const { blocks, dispatch, selectedBlockId } = useBuilder();
  const selectedBlock = useSelectedBlock(blocks, selectedBlockId);

  const handleStyleChange = useCallback(
    <K extends keyof BlockStyles>(key: K, value: BlockStyles[K]) => {
      if (!selectedBlock) return;
      dispatch({
        type: "UPDATE_STYLE",
        payload: { blockId: selectedBlock.id, styles: { [key]: value } },
      });
    },
    [dispatch, selectedBlock],
  );

  const handleContentChange = useCallback(
    (
      update:
        | Partial<TextBlockType>
        | Partial<ButtonBlockType>
        | Partial<ImageBlockType>,
    ) => {
      if (!selectedBlock) return;
      dispatch({
        type: "UPDATE_CONTENT",
        payload: { blockId: selectedBlock.id, content: update },
      });
    },
    [dispatch, selectedBlock],
  );

  return (
    <div className="w-80 shrink-0 h-[90vh] fixed right-0 mt-[10vh] border-l bg-white overflow-y-auto">
      {!selectedBlock ? (
        <div className="p-4 text-sm text-muted-foreground">
          Select a block to edit.
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-20 bg-white px-4 pt-4 pb-3 border-b">
            <div className="text-lg font-semibold capitalize">
              {selectedBlock.type} settings
            </div>
          </div>

          <Tabs defaultValue="styles">
            <TabsList className="grid grid-cols-2 w-full sticky top-[57px] z-10 bg-accent px-4 pt-3 pb-3 border-b h-fit rounded-none">
              <TabsTrigger value="styles">Styles</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="styles" className="px-4 my-4 space-y-3">
              {STYLE_FIELDS.map((field) => {
                const value = (selectedBlock.styles as BlockStyles)[field.key];
                const id = `style-${String(field.key)}`;
                if (field.type === "number") {
                  return (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={id}>{field.label}</Label>
                      <Input
                        id={id}
                        type="number"
                        value={typeof value === "number" ? value : ""}
                        onChange={(e) =>
                          handleStyleChange(
                            field.key,
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        min={field.min}
                        step={field.step}
                      />
                    </div>
                  );
                }
                if (field.type === "text" || field.type === "color") {
                  return (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={id}>{field.label}</Label>
                      <Input
                        id={id}
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          handleStyleChange(
                            field.key,
                            e.target.value === "" ? undefined : e.target.value,
                          )
                        }
                      />
                    </div>
                  );
                }
                if (field.type === "checkbox") {
                  return (
                    <div key={field.key} className="flex items-center gap-2">
                      <input
                        id={id}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) =>
                          handleStyleChange(field.key, e.target.checked)
                        }
                      />
                      <Label htmlFor={id}>{field.label}</Label>
                    </div>
                  );
                }
                if (field.type === "select" && field.options) {
                  return (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={id}>{field.label}</Label>
                      <select
                        id={id}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          handleStyleChange(
                            field.key,
                            e.target.value === ""
                              ? undefined
                              : (e.target
                                  .value as unknown as BlockStyles[typeof field.key]),
                          )
                        }
                      >
                        <option value=""></option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })}
            </TabsContent>
            <TabsContent value="content" className="px-4 mt-4 space-y-3">
              {selectedBlock.type === "text" && (
                <div className="space-y-1">
                  <Label htmlFor="text-content">Text</Label>
                  <Input
                    id="text-content"
                    value={(selectedBlock as TextBlockType).content}
                    onChange={(e) =>
                      handleContentChange({ content: e.target.value })
                    }
                  />
                </div>
              )}
              {selectedBlock.type === "button" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="btn-text">Label</Label>
                    <Input
                      id="btn-text"
                      value={(selectedBlock as ButtonBlockType).content}
                      onChange={(e) =>
                        handleContentChange({ content: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="btn-href">Href</Label>
                    <Input
                      id="btn-href"
                      value={(selectedBlock as ButtonBlockType).href}
                      onChange={(e) =>
                        handleContentChange({ href: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
              {selectedBlock.type === "image" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="img-src">Src</Label>
                    <Input
                      id="img-src"
                      value={(selectedBlock as ImageBlockType).src}
                      onChange={(e) =>
                        handleContentChange({ src: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="img-alt">Alt</Label>
                    <Input
                      id="img-alt"
                      value={(selectedBlock as ImageBlockType).alt}
                      onChange={(e) =>
                        handleContentChange({ alt: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="img-href">Href (optional)</Label>
                    <Input
                      id="img-href"
                      value={(selectedBlock as ImageBlockType).href ?? ""}
                      onChange={(e) =>
                        handleContentChange({ href: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
              {selectedBlock.type === "container" && (
                <div className="text-sm text-muted-foreground">
                  No content for container.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

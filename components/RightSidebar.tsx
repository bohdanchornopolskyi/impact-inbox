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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStyleFieldsForBlockType } from "@/lib/constants";
import StyleControls from "./StyleControls";

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
    (key: string, value: any) => {
      if (!selectedBlock) return;

      // Handle nested properties with dot notation
      if (key.includes(".")) {
        const keys = key.split(".");
        const currentStyles = selectedBlock.styles;

        // Create a deep copy and update the nested property
        const newStyles = { ...currentStyles };
        let current = newStyles as any;

        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        // Set the final value
        const finalKey = keys[keys.length - 1];
        if (value === undefined || value === "") {
          delete current[finalKey];
        } else {
          current[finalKey] = value;
        }

        dispatch({
          type: "UPDATE_STYLE",
          payload: { blockId: selectedBlock.id, styles: newStyles },
        });
      } else {
        // Handle flat properties
        dispatch({
          type: "UPDATE_STYLE",
          payload: { blockId: selectedBlock.id, styles: { [key]: value } },
        });
      }
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
    <div className="mt-[10vh] w-80 shrink-0 h-[90vh] relative">
      <div className="fixed w-80 right-0 h-full overflow-y-scroll border-l bg-white">
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
              <TabsList className="grid grid-cols-2 w-full sticky top-[57px] z-10 bg-accent/50 backdrop-blur-xs px-4 pt-3 pb-3 border-b h-fit rounded-none">
                <TabsTrigger value="styles">Styles</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="styles" className="px-4 mt-4 mb-24">
                <StyleControls
                  selectedBlock={selectedBlock}
                  fields={getStyleFieldsForBlockType(selectedBlock.type)}
                  onStyleChange={handleStyleChange}
                />
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
    </div>
  );
}

import {
  TextBlockType,
  ButtonBlockType,
  ContainerBlockType,
  ImageBlockType,
  ROOT_CONTAINER_ID,
} from "./types";

// Factory for a Text Block
export const createTextBlock = (
  parentId: string = ROOT_CONTAINER_ID,
): TextBlockType => ({
  id: crypto.randomUUID(),
  parentId,
  name: "Text Block",
  type: "text",
  content: "This is a new paragraph. Click to edit.",
  styles: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 16,
    lineHeight: 1.5,
    textAlign: "left",
  },
});

// Factory for a Button Block
export const createButtonBlock = (
  parentId: string = ROOT_CONTAINER_ID,
): ButtonBlockType => ({
  id: crypto.randomUUID(),
  parentId,
  name: "Button",
  type: "button",
  content: "Click Me",
  href: "#",
  styles: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    borderRadius: { radius: 0 },
    widthMode: "fixed",
    widthPx: 150,
  },
});

// Factory for an Image Block
export const createImageBlock = (
  parentId: string = ROOT_CONTAINER_ID,
): ImageBlockType => ({
  id: crypto.randomUUID(),
  parentId,
  name: "Image",
  type: "image",
  src: "",
  alt: "",
  styles: {
    widthMode: "fill",
    widthPx: 200,
    heightMode: "fixed",
    heightPx: 150,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    border: {
      color: "#ffffff",
      width: 0,
      style: undefined,
    },
    borderRadius: { radius: 0 },
  },
});

// Factory for a Container Block
export const createContainerBlock = (
  parentId: string = ROOT_CONTAINER_ID,
): ContainerBlockType => ({
  id: crypto.randomUUID(),
  parentId,
  name: "Container",
  type: "container",
  styles: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

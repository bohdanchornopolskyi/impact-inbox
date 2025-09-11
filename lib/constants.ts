import { StyleField } from "@/lib/types";

export const FONT_FAMILY_DEFAULT = "Arial, sans-serif";

export const FONT_FAMILY_OPTIONS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Lato", value: '"Lato", sans-serif' },
  { label: "Merriweather", value: '"Merriweather", serif' },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

export const STYLE_FIELDS: StyleField[] = [
  { key: "paddingTop", label: "Padding Top", type: "number", min: 0, step: 1 },
  {
    key: "paddingBottom",
    label: "Padding Bottom",
    type: "number",
    min: 0,
    step: 1,
  },
  {
    key: "paddingLeft",
    label: "Padding Left",
    type: "number",
    min: 0,
    step: 1,
  },
  {
    key: "paddingRight",
    label: "Padding Right",
    type: "number",
    min: 0,
    step: 1,
  },
  { key: "marginTop", label: "Margin Top", type: "number", min: 0, step: 1 },
  {
    key: "marginBottom",
    label: "Margin Bottom",
    type: "number",
    min: 0,
    step: 1,
  },
  { key: "backgroundColor", label: "Background Color", type: "text" },
  {
    key: "borderWidth",
    label: "Border Width",
    type: "number",
    min: 0,
    step: 1,
  },
  {
    key: "borderStyle",
    label: "Border Style",
    type: "select",
    options: [
      { label: "Solid", value: "solid" },
      { label: "Dotted", value: "dotted" },
      { label: "Dashed", value: "dashed" },
    ],
  },
  { key: "borderColor", label: "Border Color", type: "text" },
  {
    key: "borderRadius",
    label: "Border Radius",
    type: "number",
    min: 0,
    step: 1,
  },
  { key: "fontFamily", label: "Font Family", type: "text" },
  { key: "fontSize", label: "Font Size", type: "number", min: 1, step: 1 },
  {
    key: "fontWeight",
    label: "Font Weight",
    type: "select",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Bold", value: "bold" },
    ],
  },
  {
    key: "lineHeight",
    label: "Line Height",
    type: "number",
    min: 0.5,
    step: 0.1,
  },
  { key: "letterSpacing", label: "Letter Spacing", type: "number", step: 0.1 },
  { key: "color", label: "Text Color", type: "text" },
  {
    key: "textAlign",
    label: "Text Align",
    type: "select",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  {
    key: "textDecoration",
    label: "Text Decoration",
    type: "select",
    options: [
      { label: "None", value: "none" },
      { label: "Underline", value: "underline" },
      { label: "Line-through", value: "line-through" },
    ],
  },
  {
    key: "textWrap",
    label: "Text Wrap",
    type: "select",
    options: [
      { label: "Wrap", value: "wrap" },
      { label: "No Wrap", value: "nowrap" },
    ],
  },
  { key: "linkColor", label: "Link Color", type: "text" },
  { key: "linkUnderline", label: "Underline Links", type: "checkbox" },
  {
    key: "widthMode",
    label: "Width Mode",
    type: "select",
    options: [
      { label: "Fill", value: "fill" },
      { label: "Fixed", value: "fixed" },
    ],
  },
  { key: "widthPx", label: "Width (px)", type: "number", min: 0, step: 1 },
  {
    key: "heightMode",
    label: "Height Mode",
    type: "select",
    options: [
      { label: "Fill", value: "fill" },
      { label: "Fixed", value: "fixed" },
    ],
  },
  { key: "heightPx", label: "Height (px)", type: "number", min: 0, step: 1 },
  {
    key: "alignment",
    label: "Alignment",
    type: "select",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  {
    key: "borderTopWidth",
    label: "Divider Thickness",
    type: "number",
    min: 0,
    step: 1,
  },
  {
    key: "borderTopStyle",
    label: "Divider Style",
    type: "select",
    options: [
      { label: "Solid", value: "solid" },
      { label: "Dotted", value: "dotted" },
      { label: "Dashed", value: "dashed" },
    ],
  },
  { key: "borderTopColor", label: "Divider Color", type: "text" },
  {
    key: "listType",
    label: "List Type",
    type: "select",
    options: [
      { label: "Unordered", value: "unordered" },
      { label: "Ordered", value: "ordered" },
    ],
  },
  {
    key: "listStyleType",
    label: "List Marker",
    type: "select",
    options: [
      { label: "Disc", value: "disc" },
      { label: "Circle", value: "circle" },
      { label: "Square", value: "square" },
      { label: "Decimal", value: "decimal" },
      { label: "Lower Alpha", value: "lower-alpha" },
      { label: "Upper Alpha", value: "upper-alpha" },
      { label: "Lower Roman", value: "lower-roman" },
      { label: "Upper Roman", value: "upper-roman" },
    ],
  },
  {
    key: "itemSpacing",
    label: "Item Spacing",
    type: "number",
    min: 0,
    step: 1,
  },
  { key: "markerColor", label: "Marker Color", type: "text" },
];

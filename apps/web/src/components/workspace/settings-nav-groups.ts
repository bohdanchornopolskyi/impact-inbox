import {
  AtSign,
  Blocks,
  CreditCard,
  Globe,
  Key,
  Palette,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export const SETTINGS_NAV_ITEMS = [
  { group: "Workspace", value: "general", label: "General", icon: SlidersHorizontal },
  { group: "Workspace", value: "brand", label: "Brand", icon: Palette },
  { group: "Workspace", value: "members", label: "Members", icon: Users },
  { group: "Workspace", value: "billing", label: "Billing", icon: CreditCard },
  { group: "Sending", value: "sender-identity", label: "Sender identity", icon: AtSign },
  { group: "Sending", value: "domains", label: "Domains", icon: Globe },
  { group: "Sending", value: "deliverability", label: "Deliverability", icon: ShieldCheck },
  { group: "Platform", value: "modules", label: "Modules", icon: Blocks },
  { group: "Platform", value: "integrations", label: "Integrations", icon: Plug },
  { group: "Platform", value: "api-keys", label: "API keys", icon: Key },
] as const;

export type SettingsTab = (typeof SETTINGS_NAV_ITEMS)[number]["value"];

type SettingsGroupTitle = (typeof SETTINGS_NAV_ITEMS)[number]["group"];

const SETTINGS_GROUP_TITLES = [
  "Workspace",
  "Sending",
  "Platform",
] as const satisfies readonly SettingsGroupTitle[];

export const SETTINGS_NAV_GROUPS = SETTINGS_GROUP_TITLES.map((title) => ({
  title,
  items: SETTINGS_NAV_ITEMS.filter((item) => item.group === title),
}));

export function isSettingsTab(value: string | null): value is SettingsTab {
  return SETTINGS_NAV_ITEMS.some((item) => item.value === value);
}

export function settingsTabLabel(tab: SettingsTab): string {
  const item = SETTINGS_NAV_ITEMS.find((entry) => entry.value === tab);
  return item?.label ?? tab;
}

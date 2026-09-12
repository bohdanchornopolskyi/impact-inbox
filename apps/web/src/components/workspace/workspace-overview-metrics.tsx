"use client";

import Link from "next/link";
import type { ContactData, ContactListData, TemplateData } from "@repo/shared";
import {
  BarChart,
  DonutChart,
  ErrorState,
  HorizontalBarChart,
  MetricTile,
  type ChartDatum,
} from "@repo/ui/client";
import { useContactLists, useContacts } from "@/lib/contacts/contact-hooks";
import { useTemplates } from "@/lib/templates/template-hooks";

const CONTACT_FETCH_LIMIT = 100;

function contactStatusSeries(contacts: ContactData[]): ChartDatum[] {
  let active = 0;
  let unsubscribed = 0;
  let suppressed = 0;
  for (const contact of contacts) {
    if (contact.suppressedAt) {
      suppressed += 1;
    } else if (contact.globalUnsubscribedAt) {
      unsubscribed += 1;
    } else {
      active += 1;
    }
  }
  return [
    { label: "Active", value: active },
    { label: "Unsubscribed", value: unsubscribed },
    { label: "Suppressed", value: suppressed },
  ].filter((item) => item.value > 0);
}

function listSizeSeries(lists: ContactListData[]): ChartDatum[] {
  return [...lists]
    .filter((list) => list.memberCount > 0)
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 4)
    .map((list) => ({ label: list.name, value: list.memberCount }));
}

function inventorySeries(
  contactCount: number,
  templates: TemplateData[],
  lists: ContactListData[],
): ChartDatum[] {
  return [
    { label: "Contacts", value: contactCount },
    { label: "Templates", value: templates.length },
    { label: "Lists", value: lists.length },
  ];
}

function countLabel(count: number, cap: number): string {
  return count >= cap ? `${cap}+` : String(count);
}

export function WorkspaceOverviewMetrics({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const contactsQuery = useContacts({ limit: CONTACT_FETCH_LIMIT });
  const listsQuery = useContactLists();
  const templatesQuery = useTemplates();

  const contacts = contactsQuery.data ?? [];
  const lists = listsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];
  const contactCount = contacts.length;

  const inventoryLoading =
    contactsQuery.isLoading || listsQuery.isLoading || templatesQuery.isLoading;
  const inventoryError =
    contactsQuery.error || listsQuery.error || templatesQuery.error;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={`/${workspaceSlug}/contacts`} className="block">
          <MetricTile
            label="Contacts"
            value={
              contactsQuery.isLoading
                ? "—"
                : contactsQuery.error
                  ? "—"
                  : countLabel(contactCount, CONTACT_FETCH_LIMIT)
            }
          />
        </Link>
        <Link href={`/${workspaceSlug}/templates`} className="block">
          <MetricTile
            label="Templates"
            value={
              templatesQuery.isLoading || templatesQuery.error
                ? "—"
                : String(templates.length)
            }
          />
        </Link>
        <Link href={`/${workspaceSlug}/campaigns`} className="block">
          <MetricTile label="Campaigns" value="—" period="Coming soon" />
        </Link>
      </div>

      {inventoryError ? (
        <ErrorState
          title="We couldn't load this chart"
          description="Workspace counts did not load. Your data is unaffected."
          onRetry={() => {
            void contactsQuery.refetch();
            void listsQuery.refetch();
            void templatesQuery.refetch();
          }}
        />
      ) : (
        <BarChart
          title="Workspace inventory"
          subtitle="Contacts, templates, and lists in this workspace"
          loading={inventoryLoading}
          data={inventorySeries(contactCount, templates, lists)}
          emptyTitle="Nothing to chart yet"
          emptyDescription="Add contacts, lists, or templates to see counts here."
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {contactsQuery.error ? (
          <ErrorState
            title="We couldn't load this chart"
            description="Contact status did not load. Your audience is unaffected."
            onRetry={() => {
              void contactsQuery.refetch();
            }}
          />
        ) : (
          <DonutChart
            title="Audience status"
            subtitle={
              contactCount >= CONTACT_FETCH_LIMIT
                ? `From the first ${CONTACT_FETCH_LIMIT} contacts`
                : undefined
            }
            loading={contactsQuery.isLoading}
            data={contactStatusSeries(contacts)}
            emptyTitle="No contacts yet"
            emptyDescription="Status mix appears after you add people to this workspace."
          />
        )}

        {listsQuery.error ? (
          <ErrorState
            title="We couldn't load this chart"
            description="List sizes did not load. Your lists are unaffected."
            onRetry={() => {
              void listsQuery.refetch();
            }}
          />
        ) : (
          <HorizontalBarChart
            title="Largest lists"
            loading={listsQuery.isLoading}
            data={listSizeSeries(lists)}
            emptyTitle="No lists yet"
            emptyDescription="Create a list to see membership counts here."
          />
        )}
      </div>
    </>
  );
}

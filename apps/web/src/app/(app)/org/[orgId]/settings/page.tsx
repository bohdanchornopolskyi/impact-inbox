"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app/app-header";
import { ApiFormError } from "@/components/ui/api-form-error";
import { useSession } from "@/contexts/session-context";
import { isApiErrorCode } from "@/lib/api-error";
import { getOrganization } from "@/lib/api/organizations-api";

function formatDate(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default function OrganizationSettingsPage() {
  const params = useParams<{ orgId: string }>();
  const { token, workspaces } = useSession();
  const orgId = params.orgId;

  const organizationQuery = useQuery({
    queryKey: ["organization", orgId, token],
    queryFn: () => getOrganization(token, orgId),
    enabled: Boolean(orgId),
  });

  if (organizationQuery.isLoading) {
    return (
      <>
        <AppHeader title="Organization settings" />
        <div className="flex flex-1 items-center justify-center py-24">
          <p className="text-ui-sm text-text-secondary">Loading organization...</p>
        </div>
      </>
    );
  }

  if (
    isApiErrorCode(organizationQuery.error, "NOT_FOUND") ||
    isApiErrorCode(organizationQuery.error, "FORBIDDEN")
  ) {
    return (
      <>
        <AppHeader title="Organization settings" />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6">
          <ApiFormError
            error={
              organizationQuery.error ??
              new Error("You do not have access to this organization.")
            }
          />
          <Link
            href="/"
            className="text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </>
    );
  }

  if (organizationQuery.error || !organizationQuery.data) {
    throw organizationQuery.error ?? new Error("Failed to load organization");
  }

  const organization = organizationQuery.data;
  const organizationWorkspaces = workspaces.filter(
    (workspace) => workspace.organizationId === organization.id,
  );
  const defaultWorkspace = organizationWorkspaces[0];

  return (
    <>
      <AppHeader title={organization.name} subtitle="Organization settings" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <p className="text-ui-xs font-medium tracking-[0.2em] text-text-tertiary uppercase">
            Organization
          </p>
          <h1 className="text-ui-3xl font-semibold tracking-tight text-text-primary">
            {organization.name}
          </h1>
          <p className="text-ui-sm text-text-secondary">
            Your role: {organization.role.replace("_", " ")}
          </p>
        </div>

        <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
                Plan
              </dt>
              <dd className="mt-1 text-ui-sm text-text-primary">
                {organization.planTier ?? "Trial / unpaid"}
              </dd>
            </div>
            <div>
              <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
                Trial ends
              </dt>
              <dd className="mt-1 text-ui-sm text-text-primary">
                {formatDate(organization.trialEndsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
                Workspaces
              </dt>
              <dd className="mt-1 text-ui-sm text-text-primary">
                {organizationWorkspaces.length}
              </dd>
            </div>
            <div>
              <dt className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
                Created
              </dt>
              <dd className="mt-1 text-ui-sm text-text-primary">
                {formatDate(organization.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        {defaultWorkspace ? (
          <Link
            href={`/${defaultWorkspace.slug}`}
            className="inline-flex w-fit text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Back to {defaultWorkspace.name}
          </Link>
        ) : null}
      </div>
    </>
  );
}

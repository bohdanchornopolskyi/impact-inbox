import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {
  type AuthenticatedOrganizationContext,
  type OrganizationData,
} from "@repo/shared";

export const CurrentOrganization = createParamDecorator(
  (
    data: "organization" | undefined,
    context: ExecutionContext,
  ): AuthenticatedOrganizationContext | OrganizationData => {
    const request = context.switchToHttp().getRequest();
    const organizationContext =
      request.organizationContext as AuthenticatedOrganizationContext;
    return data === "organization"
      ? organizationContext.organization
      : organizationContext;
  },
);

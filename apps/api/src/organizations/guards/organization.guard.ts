import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasOrganizationRoleAtLeast, type OrganizationRole } from "@repo/shared";
import { ORGANIZATION_ROLES_KEY } from "src/organizations/decorators/organization-roles.decorator";
import { OrganizationAccessService } from "src/organizations/organization-access.service";

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException();
    }

    const organizationId = request.params.orgId as string | undefined;
    if (!organizationId) {
      throw new NotFoundException("Organization not found");
    }

    const organizationContext = await this.organizationAccessService.resolve(
      organizationId,
      user.id,
    );

    const requiredRoles = this.reflector.getAllAndOverride<
      OrganizationRole[] | undefined
    >(ORGANIZATION_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (
      requiredRoles?.length &&
      !hasOrganizationRoleAtLeast(organizationContext.role, requiredRoles)
    ) {
      throw new ForbiddenException("Insufficient organization permissions");
    }

    request.organizationContext = organizationContext;

    return true;
  }
}

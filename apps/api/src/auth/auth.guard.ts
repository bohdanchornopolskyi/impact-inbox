import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SessionsService } from "src/auth/sessions.service";
import { toUserProfile } from "src/common/mappers/user.mapper";
import { OrganizationsService } from "src/organizations/organizations.service";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly organizationsService: OrganizationsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const { session, user } = await this.sessionsService.validateSession(token);

    if (!user || !session) {
      throw new UnauthorizedException();
    }

    const profile = toUserProfile(user);
    request.user = profile;
    request.token = token;

    await this.organizationsService.startTrialIfEligible(
      profile.id,
      profile.emailVerifiedAt,
    );

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

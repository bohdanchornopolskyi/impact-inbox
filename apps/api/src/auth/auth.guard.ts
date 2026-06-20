import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SessionsService } from "src/auth/sessions.service";
import { toUserProfile } from "src/common/mappers/user.mapper";
import { OrganizationsService } from "src/organizations/organizations.service";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

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

    try {
      const { session, user } = await this.sessionsService.validateSession(token);

      if (!user || !session) {
        throw new UnauthorizedException();
      }

      const profile = toUserProfile(user);
      request.user = profile;
      request.token = token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException();
    }

    try {
      await this.organizationsService.startTrialIfEligible(
        request.user.id,
        request.user.emailVerifiedAt,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to start trial for user ${request.user.id}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

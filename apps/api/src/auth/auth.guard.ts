import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SessionsService } from "src/auth/sessions.service";
import { toUserProfile } from "src/common/mappers/user.mapper";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();

    if (isPublic) {
      const token = this.extractTokenFromHeader(request);
      if (token) {
        try {
          const { session, user } =
            await this.sessionsService.validateSession(token);
          if (user && session) {
            request.user = toUserProfile(user);
            request.token = token;
          }
        } catch {
          // Public routes allow missing/invalid sessions.
        }
      }
      return true;
    }

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

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { type UserProfileData } from "@repo/shared";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserProfileData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

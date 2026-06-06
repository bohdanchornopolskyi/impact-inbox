import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { type WorkspacesSelect } from "@repo/db";

export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): WorkspacesSelect => {
    const request = context.switchToHttp().getRequest();
    return request.workspace;
  },
);

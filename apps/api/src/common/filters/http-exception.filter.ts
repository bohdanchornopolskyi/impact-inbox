import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { resolveApiErrorCode } from "@repo/shared";
import type { ApiError } from "@repo/shared";

function isExceptionBody(
  body: string | object,
): body is { message?: string | string[] } {
  return typeof body === "object" && body !== null && "message" in body;
}

function toValidationDetails(message: string | string[] | undefined): string[] {
  if (!Array.isArray(message)) {
    return [];
  }

  return message.filter((item): item is string => typeof item === "string");
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private toApiError(exception: unknown, status: number): ApiError {
    const code = resolveApiErrorCode(status);

    if (!(exception instanceof HttpException)) {
      return { code, message: "Internal server error" };
    }

    const body = exception.getResponse();

    if (typeof body === "string") {
      return { code, message: body };
    }

    if (!isExceptionBody(body)) {
      return { code, message: exception.message };
    }

    const { message } = body;

    if (Array.isArray(message)) {
      return {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: toValidationDetails(message),
      };
    }

    if (typeof message === "string" && message.length > 0) {
      return { code, message };
    }

    return { code, message: exception.message };
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({ error: this.toApiError(exception, status) });
  }
}

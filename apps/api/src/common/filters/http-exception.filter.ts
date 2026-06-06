import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";
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

function formatZodIssueDetails(issues: ZodError["issues"]): string[] {
  return issues.map((issue) => {
    const field = issue.path.map(String).join(".");
    return field.length > 0 ? `${field}: ${issue.message}` : issue.message;
  });
}

function validationMessageFromIssues(issues: ZodError["issues"]): string {
  const fields = [
    ...new Set(
      issues
        .map((issue) => issue.path[0])
        .filter((field): field is string | number => field !== undefined)
        .map(String),
    ),
  ];

  const isPasswordOnly = fields.every(
    (field) => field === "password" || field === "confirmPassword",
  );

  if (isPasswordOnly && fields.length > 0) {
    return "Password does not meet requirements";
  }

  if (fields.length === 1) {
    return `Invalid ${fields[0]}`;
  }

  return "Validation failed";
}

function toZodValidationError(exception: ZodValidationException): ApiError | null {
  const zodError = exception.getZodError();

  if (!(zodError instanceof ZodError)) {
    return null;
  }

  const issues = zodError.issues;

  return {
    code: "VALIDATION_ERROR",
    message: validationMessageFromIssues(issues),
    details: formatZodIssueDetails(issues),
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private toApiError(exception: unknown, status: number): ApiError {
    const code = resolveApiErrorCode(status);

    if (!(exception instanceof HttpException)) {
      return { code, message: "Internal server error" };
    }

    if (exception instanceof ZodValidationException) {
      const zodValidationError = toZodValidationError(exception);

      if (zodValidationError) {
        return zodValidationError;
      }
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

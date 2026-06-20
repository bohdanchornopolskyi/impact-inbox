import { INestApplication } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { HttpExceptionFilter } from "src/common/filters/http-exception.filter";
import { ResponseInterceptor } from "src/common/interceptors/response.interceptor";

function getWebOrigin(): string {
  return process.env.WEB_ORIGIN ?? "http://localhost:3000";
}

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: getWebOrigin(),
    credentials: true,
  });
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
}

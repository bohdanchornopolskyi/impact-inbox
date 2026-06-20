import { Controller, Get } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  getHealth(): Promise<{ ok: true }> {
    return this.appService.getHealth();
  }
}

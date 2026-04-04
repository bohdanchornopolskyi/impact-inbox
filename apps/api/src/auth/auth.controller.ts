import { Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateSessionDto } from "src/auth/dto/create-session.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("sign-in")
  async signIn(createSessionDTO: CreateSessionDto) {
    const session = await this.authService.createSession(createSessionDTO);
    return session;
  }
}

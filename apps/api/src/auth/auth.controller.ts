import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { Public } from "src/auth/decorators/public.decorator";
import { Token } from "src/auth/decorators/token.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("sign-in")
  async signIn(@Body() signInDTO: SignInDto) {
    const { token } = await this.authService.signIn(signInDTO);
    return { token };
  }

  @Public()
  @Post("sign-up")
  async signUp(@Body() signUpDTO: SignUpDto) {
    const { token } = await this.authService.signUp(signUpDTO);
    return { token };
  }

  @Post("sign-out")
  async signOut(@Token() token: string) {
    return await this.authService.signOut(token);
  }
}

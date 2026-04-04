import { Body, Controller, Post, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { Public } from "src/auth/decorators/public.decorator";

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
    const { token } = await this.authService.SignUp(signUpDTO);
    return { token };
  }

  @Post("sign-out")
  async signOut(@Headers("authorization") authorization: string) {
    const token = authorization.replace("Bearer ", "");
    return await this.authService.signOut(token);
  }
}

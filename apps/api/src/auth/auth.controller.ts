import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UsersSelect } from "@repo/db";
import {
  type SessionData,
  type SuccessData,
} from "@repo/shared";
import { AuthService } from "./auth.service";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { ForgotPasswordDto } from "src/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/auth/dto/reset-password.dto";
import { ConfirmEmailDto } from "src/auth/dto/confirm-email.dto";
import { Public } from "src/auth/decorators/public.decorator";
import { Token } from "src/auth/decorators/token.decorator";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

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

  @Post("change-password")
  changePassword(
    @CurrentUser() user: UsersSelect,
    @Body() dto: ChangePasswordDto,
  ): Promise<SuccessData> {
    return this.authService.changePassword(user, dto);
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<SuccessData> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto): Promise<SuccessData> {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post("confirm-email")
  confirmEmail(@Body() dto: ConfirmEmailDto): Promise<SuccessData> {
    return this.authService.confirmEmail(dto);
  }

  @Post("resend-verification")
  resendVerification(@CurrentUser() user: UsersSelect): Promise<SuccessData> {
    return this.authService.resendVerification(user);
  }

  @Get("sessions")
  listSessions(
    @CurrentUser() user: UsersSelect,
    @Token() token: string,
  ): Promise<SessionData[]> {
    return this.authService.listSessions(user.id, token);
  }

  @Delete("sessions/:id")
  revokeSession(
    @CurrentUser() user: UsersSelect,
    @Token() token: string,
    @Param("id") sessionId: string,
  ): Promise<SuccessData> {
    return this.authService.revokeSession(user.id, sessionId, token);
  }
}

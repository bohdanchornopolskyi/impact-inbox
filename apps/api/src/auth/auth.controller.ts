import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { type SessionData, type SuccessData, type UserProfileData } from "@repo/shared";
import { CredentialService } from "./credential.service";
import { SessionsService } from "./sessions.service";
import { EmailVerificationService } from "./email-verification.service";
import { RegistrationService } from "src/onboarding/registration.service";
import { UsersService } from "src/users/users.service";
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
  constructor(
    private readonly credentialService: CredentialService,
    private readonly sessionsService: SessionsService,
    private readonly registrationService: RegistrationService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post("sign-in")
  async signIn(@Body() signInDTO: SignInDto) {
    const { token } = await this.credentialService.signIn(signInDTO);
    return { token };
  }

  @Public()
  @Post("sign-up")
  async signUp(@Body() signUpDTO: SignUpDto) {
    const { token } = await this.registrationService.signUp(signUpDTO);
    return { token };
  }

  @Post("sign-out")
  async signOut(@Token() token: string) {
    return await this.credentialService.signOut(token);
  }

  @Post("change-password")
  changePassword(
    @CurrentUser() user: UserProfileData,
    @Body() dto: ChangePasswordDto,
  ): Promise<SuccessData> {
    return this.credentialService.changePassword(user, dto);
  }

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<SuccessData> {
    return this.credentialService.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto): Promise<SuccessData> {
    return this.credentialService.resetPassword(dto);
  }

  @Public()
  @Post("confirm-email")
  async confirmEmail(@Body() dto: ConfirmEmailDto): Promise<SuccessData> {
    const userId =
      await this.emailVerificationService.consumeEmailVerificationToken(dto);
    await this.usersService.verifyEmail(userId);
    return { success: true };
  }

  @Post("resend-verification")
  resendVerification(@CurrentUser() user: UserProfileData): Promise<SuccessData> {
    return this.emailVerificationService.resendVerification(user);
  }

  @Get("sessions")
  listSessions(
    @CurrentUser() user: UserProfileData,
    @Token() token: string,
  ): Promise<SessionData[]> {
    return this.sessionsService.listSessions(user.id, token);
  }

  @Delete("sessions/:id")
  revokeSession(
    @CurrentUser() user: UserProfileData,
    @Token() token: string,
    @Param("id") sessionId: string,
  ): Promise<SuccessData> {
    return this.sessionsService.revokeSession(user.id, sessionId, token);
  }
}

import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';

// services
import { AuthService } from './auth.service';

// dto
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
// import { RefreshTokensDto } from './dto/refresh-tokens.dto';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
// import { ResendActivationTokenDto } from './dto/resend-activation-token.dto';
// import { EmailValidityCheckDto } from './dto/email-validity-check.dto';
// custom decorators
import { Public } from '@common/decorators/public-endpoint.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  public login(@Body() payload: UserLoginDto) {
    return this.authService.login(payload);
  }

  @Public()
  @Post('register')
  public register(@Body() payload: UserRegisterDto) {
    return this.authService.register(payload);
  }

  // @Public()
  // @Post('refresh-tokens')
  // @HttpCode(200)
  // public refreshTokens(@Body() payload: RefreshTokensDto) {
  //   return this.authService.refreshTokens(payload);
  // }
  //
  // @Public()
  // @Post('forgot-password')
  // @HttpCode(200)
  // public forgotPassword(@Body() payload: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(payload);
  // }
  //
  // @Public()
  // @Post('reset-password')
  // @HttpCode(200)
  // public resetPassword(@Body() payload: ResetPasswordDto) {
  //   return this.authService.resetPassword(payload);
  // }
  //
  // @Public()
  // @Get('verify-account')
  // @ApiQuery({ name: 'activationToken', type: String, required: true })
  // @HttpCode(200)
  // public verifyAccount(@Query() query) {
  //   console.log('asd');
  //   return this.authService.verifyAccount(query);
  // }
  //
  // @Public()
  // @Post('resend-activation-token')
  // @HttpCode(200)
  // public resendActivationToken(@Body() payload: ResendActivationTokenDto) {
  //   return this.authService.resendActivationToken(payload);
  // }
  //
  // @Public()
  // @Post('email-validity-check')
  // @HttpCode(200)
  // public emailValidityCheck(@Body() payload: EmailValidityCheckDto) {
  //   return this.authService.emailValidityCheck(payload);
  // }
}

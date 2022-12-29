import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// services
import { UsersService } from '../users/users.service';

// dto
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { EmailValidityCheckDto } from './dto/email-validity-check.dto';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: UserLoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.getUserByEmail(payload.email, true);
    if (!user || !(await compare(payload.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.activatedAt) {
      throw new ForbiddenException('Account is not activated');
    }

    // TODO: forbid login if reset password (forgot password) was requested

    return this.generateTokens(user.id);
  }

  async register(payload: UserRegisterDto): Promise<void> {
    const existingUser = await this.usersService.getUserByEmail(payload.email);
    if (!!existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    await this.usersService.createUser(payload);

    // TODO: uncomment after adding emailing feature
    // await sendAccountVerificationEmail({
    //   mailService: this.mailService,
    //   configService: this.configService,
    //   jwtService: this.jwtService,
    //   user: {
    //     id: user.id,
    //     firstName: payload.firstName,
    //     lastName: payload.lastName,
    //     email: payload.email,
    //   },
    //   isUpdateAccountRequest: false,
    // });
  }

  // public async verifyAccount(query: any): Promise<void> {
  //   if (!query) {
  //     throw new BadRequestException('Invalid token');
  //   }
  //
  //   const { activationToken }: { activationToken: string } = query;
  //
  //   let userId: string;
  //
  //   // Verify token
  //   try {
  //     const decoded = this.jwtService.verify(activationToken, {
  //       secret: this.configService.get<EnvConfig[EnvConfigEnum.JWT_PRIVATE_KEY]>(EnvConfigEnum.JWT_PRIVATE_KEY),
  //     });
  //
  //     // Just in case
  //     if (!decoded) {
  //       throw new Error('Invalid token');
  //     }
  //
  //     userId = decoded.id;
  //   } catch (ex) {
  //     throw new BadRequestException('Invalid activation token');
  //   }
  //
  //   const user = await this.usersService.getUserByID(userId);
  //   if (!!user.activatedAt) {
  //     throw new BadRequestException('Account is already verified');
  //   }
  //
  //   if (!userId) {
  //     throw new BadRequestException('Invalid activation token.');
  //   }
  //
  //   // Verify account
  //   await this.usersService.activateUserAccount(userId);
  // }

  // public async forgotPassword(data: ForgotPasswordDto): Promise<void> {
  // const { email } = data;
  // const user = await this.usersService.getUserByEmail(email);
  // if (!user) {
  //   throw new BadRequestException('User not found');
  // }
  // if (!user.activatedAt) {
  //   throw new ForbiddenException('Account is not verified');
  // }
  //
  // // TOKEN: userId, tokenId
  // const activationToken = await this.tokensService.saveToken(
  //   UserTokenTypes.RESET_PASSWORD,
  //   user.id,
  //   '2h',
  // );
  // const WEB_DOMAIN = this.configService.get(ConfigEnum.WEB_DOMAIN);
  //
  // const resetPasswordUrl = [
  //   WEB_DOMAIN,
  //   'auth',
  //   'reset-password',
  //   activationToken.token,
  // ].join('/');
  //
  // const isEmailSent = await this.mailService.sendMail(
  //   MailActions.FORGOT_PASSWORD,
  //   {
  //     to: email,
  //     templateData: {
  //       user: {
  //         fullName: `${user.firstName} ${user.lastName}`,
  //         email,
  //       },
  //       resetPasswordUrl,
  //     },
  //   },
  // );
  //
  // if (!isEmailSent) {
  //   throw new InternalServerErrorException(
  //     'Could not send email. Please try again later.',
  //   );
  // }
  // }

  // public async resetPassword(data: ResetPasswordDto): Promise<void> {
  //   if (!data || !data.token) {
  //     throw new BadRequestException('Invalid token');
  //   }
  //
  //   let decoded: { userId: number; tokenId: number } | undefined;
  //
  //   // Verify token
  //   try {
  //     decoded = this.jwtService.verify(data.token, {
  //       secret: this.configService.get(ConfigEnum.JWT_PRIVATE_KEY),
  //     });
  //   } catch (ex) {
  //     throw new BadRequestException('Invalid token');
  //   }
  //
  //   // Verify data in token
  //   if (!decoded || !decoded.userId || !decoded.tokenId) {
  //     throw new BadRequestException('Invalid token');
  //   }
  //
  //   const user = await this.usersService.getByID(decoded.userId);
  //   if (!user) {
  //     throw new BadRequestException('User with given id was not found');
  //   }
  //
  //   if (!user.activatedAt) {
  //     throw new ForbiddenException('Account is not activated');
  //   }
  //
  //   const userToken = await this.tokensService.findToken(
  //     decoded.tokenId,
  //     decoded.userId,
  //   );
  //   if (!userToken) {
  //     throw new BadRequestException('Invalid token.');
  //   }
  //
  //   await this.usersService.changeUserPassword(user.id, data.newPassword);
  //
  //   await this.tokensService.deleteToken(userToken.id);
  // }

  // public async resendActivationToken(
  //   data: ResendActivationTokenDto,
  // ): Promise<void> {
  //   const user = await this.usersService.getUserByEmail(data.email);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //
  //   if (!!user.activatedAt) {
  //     throw new BadRequestException('Account is already verified');
  //   }
  //
  //   await sendAccountVerificationEmail({
  //     mailService: this.mailService,
  //     configService: this.configService,
  //     jwtService: this.jwtService,
  //     user: {
  //       id: user.id,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //     },
  //     isUpdateAccountRequest: false,
  //   });
  // }

  public async refreshTokens(payload: RefreshTokensDto): Promise<{ accessToken: string; refreshToken: string }> {
    if (!payload.refreshToken) {
      throw new UnauthorizedException('Unauthorized. refreshToken is required');
    }

    let decoded: { id: string };

    try {
      decoded = await this.jwtService.verify(payload.refreshToken);
    } catch (ex) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!decoded || !decoded.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.usersService.getUserByID(decoded.id);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.generateTokens(decoded.id);
  }

  public async emailValidityCheck(data: EmailValidityCheckDto): Promise<void> {
    const user = this.usersService.getUserByEmail(data.email);
    if (!!user) {
      throw new ConflictException('This email is already taken');
    }
  }

  private async generateTokens(userID: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      id: userID,
    };

    const privateKey = this.configService.get<EnvConfig[EnvConfigEnum.JWT_PRIVATE_KEY]>(EnvConfigEnum.JWT_PRIVATE_KEY);

    const accessToken = await this.jwtService.signAsync(payload, {
      privateKey,
      expiresIn: this.configService.get<EnvConfig[EnvConfigEnum.JWT_EXPIRE]>(EnvConfigEnum.JWT_EXPIRE),
      algorithm: this.configService.get<EnvConfig[EnvConfigEnum.JWT_SIGN_ALGORITHM]>(EnvConfigEnum.JWT_SIGN_ALGORITHM),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      privateKey,
      expiresIn: this.configService.get<EnvConfig[EnvConfigEnum.JWT_REFRESH_EXPIRE]>(EnvConfigEnum.JWT_REFRESH_EXPIRE),
      algorithm: this.configService.get<EnvConfig[EnvConfigEnum.JWT_SIGN_ALGORITHM]>(EnvConfigEnum.JWT_SIGN_ALGORITHM),
    });

    return { accessToken, refreshToken };
  }
}

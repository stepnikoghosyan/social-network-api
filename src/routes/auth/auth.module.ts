import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// modules
import { UsersModule } from '../users/users.module';

// services
import { AuthService } from './auth.service';

// controllers
import { AuthController } from './auth.controller';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(EnvConfigEnum.JWT_PRIVATE_KEY),
        signOptions: {
          algorithm: configService.get<EnvConfig[EnvConfigEnum.JWT_SIGN_ALGORITHM]>(EnvConfigEnum.JWT_SIGN_ALGORITHM),
          expiresIn: configService.get<EnvConfig[EnvConfigEnum.JWT_EXPIRE]>(EnvConfigEnum.JWT_EXPIRE),
        },
      }),
    }),
    // TokensModule,
    // MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

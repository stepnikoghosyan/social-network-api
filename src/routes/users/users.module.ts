import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// services
import { UsersService } from './users.service';

// repositories
import { UsersRepository } from './users.repository';

// controllers
import { UsersController } from './users.controller';

// entities
import { User } from './user.entity';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
    // MulterModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: multerConfigFactory(MulterConfigType.profilePictures),
    // }),
    // AttachmentsModule,
    // MailModule,
  ],
  providers: [UsersRepository, UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// modules
import { AttachmentsModule } from '@common/modules/attachments/attachments.module';

// services
import { UsersService } from './users.service';

// controllers
import { UsersController } from './users.controller';

// entities
import { User } from './user.entity';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigType } from '@common/models/multer-config-type.model';

// utils
import { multerConfigFactory } from '@common/utils/multer-config-factory.util';

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
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: multerConfigFactory(MulterConfigType.profilePictures),
    }),
    AttachmentsModule,
    // MailModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

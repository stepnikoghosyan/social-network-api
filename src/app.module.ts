import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// modules
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';

// passport
import { JwtStrategy } from './routes/auth/passport-strategies/jwt.strategy';
import { JwtAuthGuard } from '@common/guards/jwt-auth-guard.service';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';
import { Environment } from '@common/models/environment.model';

// utils
import { getEntitiesList } from './utils/entities-list.util';
import { getEnvVarsValidationSchema } from './environments/validation-schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `${process.cwd()}/src/environments/${process.env.NODE_ENV}.env`,
      validationSchema: getEnvVarsValidationSchema(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<EnvConfig[EnvConfigEnum.DATABASE_HOST]>(EnvConfigEnum.DATABASE_HOST),
        port: +configService.get<EnvConfig[EnvConfigEnum.DATABASE_PORT]>(EnvConfigEnum.DATABASE_PORT),
        username: configService.get<EnvConfig[EnvConfigEnum.DATABASE_USERNAME]>(EnvConfigEnum.DATABASE_USERNAME),
        password: configService.get<EnvConfig[EnvConfigEnum.DATABASE_PASSWORD]>(EnvConfigEnum.DATABASE_PASSWORD),
        database: configService.get<EnvConfig[EnvConfigEnum.DATABASE_NAME]>(EnvConfigEnum.DATABASE_NAME),
        entities: getEntitiesList(),
        synchronize: true, // TODO: remove after release
        logging:
          configService.get<EnvConfig[EnvConfigEnum.NODE_ENV]>(EnvConfigEnum.NODE_ENV) === Environment.LOCAL ||
          configService.get<EnvConfig[EnvConfigEnum.NODE_ENV]>(EnvConfigEnum.NODE_ENV) === Environment.DEVELOPMENT,
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            process.cwd(),
            configService.get<EnvConfig[EnvConfigEnum.ROOT_STORAGE_PATH]>(EnvConfigEnum.ROOT_STORAGE_PATH),
          ),
          serveRoot:
            '/' +
            configService.get<EnvConfig[EnvConfigEnum.ROOT_PUBLIC_STORAGE_PATH]>(
              EnvConfigEnum.ROOT_PUBLIC_STORAGE_PATH,
            ),
        },
      ],
    }),

    AuthModule,
    UsersModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

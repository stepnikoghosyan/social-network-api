import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// services
import { AppService } from './app.service';

// controllers
import { AppController } from './app.controller';

// models
import { EnvConfig, EnvConfigEnum } from './common/interfaces/env-config.model';

// configs
import { getEnvVarsValidationSchema } from './environments/validation-schema';

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
        synchronize: true, // TODO: remove after release
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// modules
import { AppModule } from './app.module';

// models
import { EnvConfig, EnvConfigEnum } from '@common/models/env-config.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // app.useStaticAssets(
  //   join(process.cwd(), configService.get<EnvConfig[EnvConfigEnum.ROOT_STORAGE_PATH]>(EnvConfigEnum.ROOT_STORAGE_PATH)),
  //   {
  //     prefix: '/public/',
  //   },
  // );

  // Swagger
  const config = new DocumentBuilder().setTitle('Social Network API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  await app.listen(configService.get<EnvConfig[EnvConfigEnum.PORT]>(EnvConfigEnum.PORT) || process.env.PORT);
}

bootstrap();

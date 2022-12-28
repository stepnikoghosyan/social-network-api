import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// models
import { EnvConfig, EnvConfigEnum } from './common/interfaces/env-config.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Swagger
  const config = new DocumentBuilder().setTitle('Blog API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  await app.listen(configService.get<EnvConfig[EnvConfigEnum.PORT]>(EnvConfigEnum.PORT) || process.env.PORT);
}
bootstrap();

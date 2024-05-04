import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('app.port');
  app.enableCors({
    origin: configService.get('app.client-url'),
    credentials: true,
  });
  await app.listen(port);
  Logger.log('is listening on port', port);
}
bootstrap();

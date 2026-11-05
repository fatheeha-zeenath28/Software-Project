import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
  });

  const config = new DocumentBuilder()
    .setTitle('A/L ICT Digital Learning Platform API')
    .setVersion('0.1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-user-id', in: 'header' },
      'mock-user',
    )
    .addSecurityRequirements('mock-user')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');

  console.log(
    'API running on http://localhost:3000/api (docs: /api/docs)',
  );
}

if (require.main === module) bootstrap();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
      const wildcardPattern = /^https?:\/\/[a-zA-Z0-9-]+\.caretakerapp\.com$/;
      if (!origin || allowedOrigins.includes(origin) || wildcardPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev; tighten in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Caretaker API running on http://localhost:${port}/api`);
}
bootstrap();

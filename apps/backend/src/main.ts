import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set in production`);
  }
  return value;
}

async function bootstrap() {
  requiredEnv('DATABASE_URL');
  requiredEnv('JWT_SECRET');
  requiredEnv('CORS_ORIGIN');

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const isLocalhost = origin && (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin === 'http://localhost' ||
        origin === 'https://localhost' ||
        /\.localhost(:\d+)?$/.test(origin)
      );

      if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`), false);
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
  console.log(`Caretaker API listening on port ${port}`);
}
bootstrap();

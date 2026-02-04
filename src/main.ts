import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true,
      forbidNonWhitelisted : true,
      transform : true
    }),
  );
  app.useGlobalGuards(new JwtAuthGuard());
  app.use(cookieParser());
  app.enableCors({
    origin : process.env.FRONTEND_URL,
    credentials : true
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

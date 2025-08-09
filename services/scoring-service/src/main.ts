import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  console.log(`Scoring service is running on port ${port}`);
}

bootstrap();

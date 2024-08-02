import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: ['http://localhost:3001'],
		credentials: true,
		exposedHeaders: 'set-cookie'
	});

	app.setGlobalPrefix('api');
	app.use(cookieParser());

	app.useGlobalPipes(new ValidationPipe());

	await app.listen(3000);
}
bootstrap();

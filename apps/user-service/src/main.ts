import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UserServiceModule } from './user-services.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UserServiceModule,{
    bodyParser: false
  });

  app.use('/enrollment/stripe/webhook', express.raw({ type: 'application/json' }))

  app.use('/enrollment/razorpay/webhook', express.raw({ type: 'application/json' }))

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('API documentation for the Auth Service')
    .setVersion('1.0')
    .addBearerAuth( 
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.servers =[{ url: '/users' }]
  SwaggerModule.setup('api', app, document);

  const port = process.env.USER_PORT || 3000;
  await app.listen(port);

  console.log(`User service listening on ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api`);
}
bootstrap();

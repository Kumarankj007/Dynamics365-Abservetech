import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthServiceModule } from './auth-service.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthServiceModule);
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
  document.servers =[{ url: '/auth' }]
  SwaggerModule.setup('api', app, document);

  const port = process.env.AUTH_PORT || 3000;
  await app.listen(port);
  console.log(`Auth service listening on ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api`);
}
bootstrap();

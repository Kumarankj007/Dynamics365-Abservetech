import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().get('/', (req: any, res: any) => {
        res.send('Api Service is running');
    });
  app.enableCors()  
  app.use('/admins', createProxyMiddleware({ target: `http://localhost:${process.env.ADMIN_PORT || 3003}`, changeOrigin: true, pathRewrite: (path) => path.replace(/^\/admins/, '')}))
  app.use('/users', createProxyMiddleware({ target: `http://localhost:${process.env.USER_PORT || 3004}`, changeOrigin: true, pathRewrite: (path) => path.replace(/^\/users/, '')}))
  app.use('/auth', createProxyMiddleware({ target: `http://localhost:${process.env.AUTH_PORT|| 3005}`, changeOrigin: true, pathRewrite: (path) => path.replace(/^\/auth/, '')}))

  const port = process.env.COMMON_PORT || 3002
  await app.listen(port, '0.0.0.0');
  console.log(`✅ API Gateway running on http://0.0.0.0:${port}`);
  console.log(`🔗 Admins service via gateway: http://0.0.0.0:${port}/admins`);
  console.log(`🔗 Users service via gateway: http://0.0.0.0:${port}/users`);
  console.log(`🔗 Auth service via gateway: http://0.0.0.0:${port}/auth`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './utils/swagger'
import { urlencoded, json } from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
  });
  setupSwagger(app);
  app.use(json({ limit: '1tb' }));
  app.use(urlencoded({ limit: '1tb', extended: true }))
  // app.useGlobalFilters(new HttpExceptionFilter());
  // //Global Middleware 설정 -> Cors 속성 활성화
  // app.enableCors({
  //   origin: '*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   optionsSuccessStatus: 200,
  // });
  await app.listen(5005);
}
bootstrap();

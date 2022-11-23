import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    AuthModule,
    FilesModule,
    MulterModule,
    TypeOrmModule.forRoot(typeORMConfig),
    MenuModule,
  ],
})
export class AppModule { }

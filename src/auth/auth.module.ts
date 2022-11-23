import { Module } from '@nestjs/common';
import { Util } from 'src/utils/util';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Util],
})
export class AuthModule { }

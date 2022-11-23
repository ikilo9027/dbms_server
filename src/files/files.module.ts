import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Util } from 'src/utils/util';
import { FileRepository } from './file.repository';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileRepository])
  ],
  controllers: [FilesController],
  providers: [FilesService, Util]
})
export class FilesModule { }

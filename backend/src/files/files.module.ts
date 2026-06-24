import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileEntity } from './file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.register({
      dest: './uploads',
      limits: { fileSize: 1024 * 1024 * 1024 }, // 1 Go max
    }),
  ],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
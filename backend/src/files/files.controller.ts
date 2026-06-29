import {
  Controller, Post, Get, Delete, Param, Query,
  UseInterceptors, UploadedFile, Body, Req,
  UseGuards, ForbiddenException, Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('files/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('password') password: string,
    @Body('expires_in_days') expiresInDays: number,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || null;
    const result = await this.filesService.upload(file, userId, password, expiresInDays);
    return {
      file_id: result.id,
      download_token: result.downloadToken,
      download_url: `${process.env.APP_URL || 'http://localhost:3000'}/d/${result.downloadToken}`,
      expires_at: result.expiresAt,
    };
  }

  @Get('files')
  @UseGuards(JwtAuthGuard)
  async getFiles(
    @Query('filter') filter: string,
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const { items, total } = await this.filesService.findByUser(
      req.user.sub,
      filter,
      pageNum,
      limitNum,
    );
    return {
      items: items.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        sizeBytes: file.sizeBytes,
        uploadedAt: file.uploadedAt,
        expiresAt: file.expiresAt,
        downloadToken: file.downloadToken,
        hasPassword: !!file.passwordHash,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Delete('files/:id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: string, @Req() req: any) {
    await this.filesService.delete(id, req.user.sub);
    return { message: 'Fichier supprimé' };
  }

  @Get('d/:token')
  async getFileInfo(@Param('token') token: string) {
    const file = await this.filesService.findByToken(token);
    if (new Date() > file.expiresAt) throw new ForbiddenException('Ce lien a expiré');
    return {
      file_name: file.originalName,
      size: file.sizeBytes,
      mime_type: file.mimeType,
      expires_at: file.expiresAt,
      has_password: !!file.passwordHash,
    };
  }

  @Post('d/:token/download')
  async downloadFile(
    @Param('token') token: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const file = await this.filesService.findByToken(token);
    if (new Date() > file.expiresAt) throw new ForbiddenException('Ce lien a expiré');

    if (file.passwordHash) {
      const valid = await this.filesService.verifyPassword(token, password);
      if (!valid) throw new ForbiddenException('Mot de passe incorrect');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    fs.createReadStream(file.storagePath).pipe(res);
  }
}
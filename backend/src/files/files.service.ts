import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repo: Repository<FileEntity>,
  ) {}

  async upload(
    file: Express.Multer.File,
    userId: string | null,
    password?: string,
    expiresInDays?: number,
  ): Promise<FileEntity> {
    const days = expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const newFile = new FileEntity();
    newFile.originalName = file.originalname;
    newFile.storagePath = file.path;
    newFile.mimeType = file.mimetype;
    newFile.sizeBytes = file.size;
    newFile.downloadToken = uuidv4();
    newFile.passwordHash = passwordHash;
    newFile.expiresAt = expiresAt;
    newFile.userId = userId;

    return this.repo.save(newFile);
  }

  async findByUser(userId: string, filter?: string): Promise<FileEntity[]> {
    const query = this.repo.createQueryBuilder('file')
      .where('file.user_id = :userId', { userId });

    if (filter === 'active') {
      query.andWhere('file.expiresAt > :now', { now: new Date() });
    } else if (filter === 'expired') {
      query.andWhere('file.expiresAt <= :now', { now: new Date() });
    }

    return query.getMany();
  }

  async findByToken(token: string): Promise<FileEntity> {
    const file = await this.repo.findOne({
      where: { downloadToken: token }
    });
    if (!file) throw new NotFoundException('Lien invalide');
    return file;
  }

  async delete(fileId: string, userId: string): Promise<void> {
    const file = await this.repo.findOne({
      where: { id: fileId, userId }
    });
    if (!file) throw new NotFoundException('Fichier introuvable');

    if (fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
    }

    await this.repo.remove(file);
  }

  async verifyPassword(token: string, password: string): Promise<boolean> {
    const file = await this.findByToken(token);
    if (!file.passwordHash) return true;
    return bcrypt.compare(password, file.passwordHash);
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileEntity } from './file.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

// Taille maximale autorisee pour un fichier (1 Go). Limiter la taille
// protege le serveur d'un deni de service par saturation du disque.
const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;

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
    // Securite : on refuse les fichiers trop volumineux. C'est une seconde
    // barriere, en plus de la limite de Multer, au cas ou un fichier passerait
    // (et pour pouvoir renvoyer un message clair au client).
    if (file.size > MAX_FILE_SIZE_BYTES) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Fichier trop volumineux : maximum 1 Go.');
    }

    if (password && password.length < 6) {
      throw new BadRequestException('Mot de passe : minimum 6 caractères.');
    }

    // Sécurité : on inspecte le CONTENU réel du fichier (ses premiers octets,
    // le « magic number »), pas son extension ni son Content-Type qui sont
    // tous deux falsifiables. Un exécutable renommé en .txt est donc détecté.
    if (this.isExecutable(file.path)) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Type de fichier non autorisé : exécutable détecté.');
    }

    // Durée d'expiration : optionnelle (7 jours par défaut), mais bornée
    // entre 1 et 7 jours et validée ici, côté serveur (spec US01 / US10).
    let days = 7;
    if (expiresInDays !== undefined && expiresInDays !== null && `${expiresInDays}` !== '') {
      days = Number(expiresInDays);
      if (!Number.isInteger(days) || days < 1 || days > 7) {
        fs.unlinkSync(file.path);
        throw new BadRequestException("Durée d'expiration : entre 1 et 7 jours.");
      }
    }
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

  // Liste paginée des fichiers d'un utilisateur. La pagination (skip/take) évite
  // de tout charger d'un coup quand un compte a beaucoup de fichiers.
  async findByUser(
    userId: string,
    filter?: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: FileEntity[]; total: number }> {
    const query = this.repo.createQueryBuilder('file')
      .where('file.user_id = :userId', { userId })
      .orderBy('file.uploadedAt', 'DESC');

    if (filter === 'active') {
      query.andWhere('file.expiresAt > :now', { now: new Date() });
    } else if (filter === 'expired') {
      query.andWhere('file.expiresAt <= :now', { now: new Date() });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
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

  // Supprime tous les fichiers expirés, du disque ET de la base. Renvoie le
  // nombre de fichiers purgés. (Spec US01/US10 : suppression à expiration.)
  async purgeExpired(): Promise<number> {
    const expired = await this.repo.find({
      where: { expiresAt: LessThanOrEqual(new Date()) },
    });
    for (const file of expired) {
      if (fs.existsSync(file.storagePath)) {
        fs.unlinkSync(file.storagePath);
      }
    }
    if (expired.length > 0) {
      await this.repo.remove(expired);
    }
    return expired.length;
  }

  // Tâche planifiée : purge automatique des fichiers expirés, chaque jour.
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleExpiredCleanup(): Promise<void> {
    await this.purgeExpired();
  }

  // Lit les premiers octets du fichier et les compare aux signatures connues
  // des exécutables. Renvoie true si le fichier est un exécutable, quelle que
  // soit son extension.
  private isExecutable(filePath: string): boolean {
    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(4);
    fs.readSync(fd, header, 0, 4, 0);
    fs.closeSync(fd);

    const signatures = [
      [0x4d, 0x5a],             // "MZ"      -> exécutable Windows (.exe, .dll)
      [0x7f, 0x45, 0x4c, 0x46], // "\x7FELF" -> exécutable Linux
      [0xfe, 0xed, 0xfa, 0xce], // Mach-O    -> exécutable macOS
      [0xfe, 0xed, 0xfa, 0xcf],
      [0xcf, 0xfa, 0xed, 0xfe],
      [0xca, 0xfe, 0xba, 0xbe], // Mach-O universel
      [0x23, 0x21],             // "#!"      -> script shell
    ];
    return signatures.some((sig) => sig.every((byte, i) => header[i] === byte));
  }
}
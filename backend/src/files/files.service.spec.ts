import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;

  const mockFile = {
    id: '123',
    originalName: 'test.txt',
    storagePath: '/uploads/test.txt',
    mimeType: 'text/plain',
    sizeBytes: 100,
    downloadToken: 'abc-token',
    passwordHash: null,
    expiresAt: new Date(Date.now() + 86400000),
    userId: 'user-123',
  };

  const mockRepo = {
    create: jest.fn().mockReturnValue(mockFile),
    save: jest.fn().mockResolvedValue(mockFile),
    findOne: jest.fn().mockResolvedValue(mockFile),
    find: jest.fn().mockResolvedValue([]),
    remove: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockFile], 1]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(FileEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should find file by token', async () => {
    const file = await service.findByToken('abc-token');
    expect(file.downloadToken).toBe('abc-token');
  });

  it('should throw NotFoundException if token not found', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findByToken('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should find files by user (paginated)', async () => {
    const result = await service.findByUser('user-123');
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find files by user with active filter', async () => {
    const result = await service.findByUser('user-123', 'active');
    expect(result.items).toHaveLength(1);
  });

  it('should find files by user with expired filter', async () => {
    const result = await service.findByUser('user-123', 'expired');
    expect(result.items).toHaveLength(1);
  });

  it('should verify password correctly when no password set', async () => {
    const result = await service.verifyPassword('abc-token', 'any');
    expect(result).toBe(true);
  });

  it('should verify password correctly when password is set', async () => {
    const hash = await bcrypt.hash('password123', 10);
    mockRepo.findOne.mockResolvedValueOnce({ ...mockFile, passwordHash: hash });
    const result = await service.verifyPassword('abc-token', 'password123');
    expect(result).toBe(true);
  });

  it('should upload a file', async () => {
    const tmpPath = path.join(os.tmpdir(), `ds_test_${Date.now()}.txt`);
    fs.writeFileSync(tmpPath, 'contenu texte normal');
    const mockMulterFile = {
      originalname: 'test.txt',
      path: tmpPath,
      mimetype: 'text/plain',
      size: 100,
    } as Express.Multer.File;

    const result = await service.upload(mockMulterFile, 'user-123');
    expect(result.originalName).toBe('test.txt');
    jest.requireActual('fs').unlinkSync(tmpPath);
  });

  it('should reject an executable file even if renamed (magic number)', async () => {
    const tmpPath = path.join(os.tmpdir(), `ds_evil_${Date.now()}.txt`);
    // En-tête "MZ" = exécutable Windows, malgré l'extension .txt
    fs.writeFileSync(tmpPath, Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x41, 0x42]));
    const mockMulterFile = {
      originalname: 'innocent.txt',
      path: tmpPath,
      mimetype: 'text/plain',
      size: 6,
    } as Express.Multer.File;

    // on verifie le type d'erreur ET le message renvoye a l'utilisateur
    await expect(service.upload(mockMulterFile, 'user-123'))
      .rejects.toThrow(BadRequestException);
    await expect(service.upload(mockMulterFile, 'user-123'))
      .rejects.toThrow('Type de fichier non autorisé : exécutable détecté.');
    // le fichier dangereux doit avoir été supprimé du disque
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpPath);
    jest.requireActual('fs').unlinkSync(tmpPath);
  });

  it('should reject a shell script disguised as a text file (#! magic number)', async () => {
    const tmpPath = path.join(os.tmpdir(), `ds_script_${Date.now()}.txt`);
    // En-tete "#!" = script shell, malgre l'extension .txt
    fs.writeFileSync(tmpPath, '#!/bin/sh\nrm -rf /\n');
    const mockMulterFile = {
      originalname: 'notes.txt',
      path: tmpPath,
      mimetype: 'text/plain',
      size: 18,
    } as Express.Multer.File;

    await expect(service.upload(mockMulterFile, 'user-123'))
      .rejects.toThrow('Type de fichier non autorisé : exécutable détecté.');
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpPath);
    jest.requireActual('fs').unlinkSync(tmpPath);
  });

  // Meme logique de detection (comparaison du magic number) pour les
  // executables Linux (ELF) et macOS (Mach-O), pas seulement Windows.
  it.each([
    ['ELF (Linux)', [0x7f, 0x45, 0x4c, 0x46]],
    ['Mach-O (macOS)', [0xfe, 0xed, 0xfa, 0xce]],
  ])('should reject a %s executable (magic number)', async (_label, magic) => {
    const tmpPath = path.join(os.tmpdir(), `ds_bin_${_label}_${Date.now()}.txt`);
    fs.writeFileSync(tmpPath, Buffer.from([...magic, 0x00, 0x00]));
    const mockMulterFile = {
      originalname: 'innocent.txt',
      path: tmpPath,
      mimetype: 'text/plain',
      size: 6,
    } as Express.Multer.File;

    await expect(service.upload(mockMulterFile, 'user-123'))
      .rejects.toThrow('Type de fichier non autorisé : exécutable détecté.');
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpPath);
    jest.requireActual('fs').unlinkSync(tmpPath);
  });

  it('should reject a file larger than the size limit (DoS protection)', async () => {
    const mockMulterFile = {
      originalname: 'enorme.zip',
      path: '/uploads/enorme.zip',
      mimetype: 'application/zip',
      size: 1024 * 1024 * 1024 + 1, // 1 octet de trop (> 1 Go)
    } as Express.Multer.File;

    await expect(service.upload(mockMulterFile, 'user-123'))
      .rejects.toThrow('Fichier trop volumineux : maximum 1 Go.');
    // le fichier deja ecrit sur le disque par Multer doit etre supprime
    expect(fs.unlinkSync).toHaveBeenCalledWith('/uploads/enorme.zip');
  });

  it('should throw BadRequestException if file password is too short', async () => {
    const mockMulterFile = {
      originalname: 'test.txt',
      path: '/uploads/test.txt',
      mimetype: 'text/plain',
      size: 100,
    } as Express.Multer.File;

    await expect(service.upload(mockMulterFile, 'user-123', '123'))
      .rejects.toThrow('Mot de passe : minimum 6 caractères.');
  });

  it('should delete a file without physical file', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    await expect(service.delete('123', 'user-123')).resolves.not.toThrow();
  });

  it('should delete the physical file when it exists on disk', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
    await service.delete('123', 'user-123');
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockFile.storagePath);
  });

  it('should throw NotFoundException when deleting non-existent file', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.delete('999', 'user-123')).rejects.toThrow(NotFoundException);
  });

  it("should not let a user delete another user's file", async () => {
    // delete() filtre par { id, userId } : un fichier appartenant a un autre
    // utilisateur n'est jamais trouve, donc la requete repond NotFound et
    // aucune suppression (disque + base) n'est effectuee.
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.delete('file-de-user-123', 'attaquant'))
      .rejects.toThrow(NotFoundException);
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'file-de-user-123', userId: 'attaquant' },
    });
    expect(mockRepo.remove).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it("should reject an expiration duration over 7 days (server-side validation)", async () => {
    // Spec US01 / US10 : la duree est au maximum 7 jours, validee cote serveur.
    const tmpPath = path.join(os.tmpdir(), `ds_exp_${Date.now()}.txt`);
    fs.writeFileSync(tmpPath, 'contenu normal');
    const mockMulterFile = {
      originalname: 'a.txt',
      path: tmpPath,
      mimetype: 'text/plain',
      size: 50,
    } as Express.Multer.File;

    await expect(service.upload(mockMulterFile, 'user-123', undefined, 30))
      .rejects.toThrow("Durée d'expiration : entre 1 et 7 jours.");
    jest.requireActual('fs').unlinkSync(tmpPath);
  });

  it('purgeExpired supprime les fichiers expirés du disque et de la base', async () => {
    const expired = [
      { ...mockFile, id: 'e1', storagePath: '/uploads/old1' },
      { ...mockFile, id: 'e2', storagePath: '/uploads/old2' },
    ];
    mockRepo.find.mockResolvedValueOnce(expired);
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    const count = await service.purgeExpired();

    expect(count).toBe(2);
    expect(fs.unlinkSync).toHaveBeenCalledWith('/uploads/old1');
    expect(fs.unlinkSync).toHaveBeenCalledWith('/uploads/old2');
    expect(mockRepo.remove).toHaveBeenCalledWith(expired);
  });
});
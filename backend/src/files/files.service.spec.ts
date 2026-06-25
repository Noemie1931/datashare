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
    remove: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockFile]),
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

  it('should find files by user', async () => {
    const files = await service.findByUser('user-123');
    expect(files).toHaveLength(1);
  });

  it('should find files by user with active filter', async () => {
    const files = await service.findByUser('user-123', 'active');
    expect(files).toHaveLength(1);
  });

  it('should find files by user with expired filter', async () => {
    const files = await service.findByUser('user-123', 'expired');
    expect(files).toHaveLength(1);
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

    await expect(service.upload(mockMulterFile, 'user-123'))
      .rejects.toThrow(BadRequestException);
    // le fichier dangereux doit avoir été supprimé du disque
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpPath);
    jest.requireActual('fs').unlinkSync(tmpPath);
  });

  it('should throw BadRequestException if file password is too short', async () => {
    const mockMulterFile = {
      originalname: 'test.txt',
      path: '/uploads/test.txt',
      mimetype: 'text/plain',
      size: 100,
    } as Express.Multer.File;

    await expect(service.upload(mockMulterFile, 'user-123', '123'))
      .rejects.toThrow(BadRequestException);
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
});
import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(),
}));

describe('FilesController', () => {
  let controller: FilesController;

  const mockFilesService = {
    upload: jest.fn(),
    findByUser: jest.fn(),
    delete: jest.fn(),
    findByToken: jest.fn(),
    verifyPassword: jest.fn(),
  };

  // un lien encore valide expire dans le futur, un lien expiré dans le passé
  const futureDate = new Date(Date.now() + 86400000);
  const pastDate = new Date(Date.now() - 86400000);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: mockFilesService }],
    }).compile();
    controller = module.get<FilesController>(FilesController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('upload', () => {
    it("renvoie le token et l'URL de téléchargement", async () => {
      mockFilesService.upload.mockResolvedValue({
        id: 'f1',
        downloadToken: 'tok-123',
        expiresAt: futureDate,
      });
      const result = await controller.upload(
        { originalname: 'a.txt' } as any,
        '',
        1,
        { user: { sub: 'u1' } },
      );
      expect(result.download_token).toBe('tok-123');
      expect(result.download_url).toContain('/d/tok-123');
    });

    it("propage l'erreur 400 quand le fichier est d'un format interdit", async () => {
      // le service refuse les executables (verif du magic number) ; le
      // controleur doit laisser remonter cette erreur au client
      mockFilesService.upload.mockRejectedValue(
        new BadRequestException('Type de fichier non autorisé : exécutable détecté.'),
      );
      await expect(
        controller.upload(
          { originalname: 'virus.txt' } as any,
          '',
          1,
          { user: { sub: 'u1' } },
        ),
      ).rejects.toThrow('Type de fichier non autorisé : exécutable détecté.');
    });
  });

  describe('getFiles', () => {
    it("renvoie la liste des fichiers de l'utilisateur avec hasPassword", async () => {
      mockFilesService.findByUser.mockResolvedValue([
        {
          id: 'f1',
          originalName: 'a.txt',
          sizeBytes: 10,
          uploadedAt: futureDate,
          expiresAt: futureDate,
          downloadToken: 't',
          passwordHash: 'hash',
        },
      ]);
      const result = await controller.getFiles('all', { user: { sub: 'u1' } });
      expect(result).toHaveLength(1);
      expect(result[0].hasPassword).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('supprime le fichier et renvoie un message', async () => {
      mockFilesService.delete.mockResolvedValue(undefined);
      const result = await controller.deleteFile('f1', { user: { sub: 'u1' } });
      expect(result.message).toBe('Fichier supprimé');
      expect(mockFilesService.delete).toHaveBeenCalledWith('f1', 'u1');
    });
  });

  describe('getFileInfo', () => {
    it('renvoie les infos pour un lien valide', async () => {
      mockFilesService.findByToken.mockResolvedValue({
        originalName: 'a.txt',
        sizeBytes: 10,
        mimeType: 'text/plain',
        expiresAt: futureDate,
        passwordHash: null,
      });
      const info = await controller.getFileInfo('tok');
      expect(info.file_name).toBe('a.txt');
      expect(info.has_password).toBe(false);
    });

    it('renvoie 403 si le lien est expiré', async () => {
      mockFilesService.findByToken.mockResolvedValue({ expiresAt: pastDate });
      await expect(controller.getFileInfo('tok')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('downloadFile', () => {
    const res = { setHeader: jest.fn() } as any;

    it('renvoie 403 si le lien est expiré', async () => {
      mockFilesService.findByToken.mockResolvedValue({ expiresAt: pastDate });
      await expect(controller.downloadFile('tok', '', res)).rejects.toThrow(ForbiddenException);
    });

    it('renvoie 403 si le mot de passe du fichier est incorrect', async () => {
      mockFilesService.findByToken.mockResolvedValue({
        expiresAt: futureDate,
        passwordHash: 'hash',
        originalName: 'a.txt',
        mimeType: 'text/plain',
      });
      mockFilesService.verifyPassword.mockResolvedValue(false);
      await expect(controller.downloadFile('tok', 'mauvais', res))
        .rejects.toThrow(ForbiddenException);
    });

    it('télécharge le fichier quand il n\'a pas de mot de passe', async () => {
      const pipe = jest.fn();
      (fs.createReadStream as jest.Mock).mockReturnValue({ pipe });
      mockFilesService.findByToken.mockResolvedValue({
        expiresAt: futureDate,
        passwordHash: null,
        originalName: 'a.txt',
        mimeType: 'text/plain',
        storagePath: '/uploads/x',
      });
      await controller.downloadFile('tok', '', res);
      expect(res.setHeader).toHaveBeenCalled();
      expect(pipe).toHaveBeenCalledWith(res);
    });

    it('télécharge le fichier avec le bon mot de passe', async () => {
      const pipe = jest.fn();
      (fs.createReadStream as jest.Mock).mockReturnValue({ pipe });
      mockFilesService.findByToken.mockResolvedValue({
        expiresAt: futureDate,
        passwordHash: 'hash',
        originalName: 'a.txt',
        mimeType: 'text/plain',
        storagePath: '/uploads/x',
      });
      mockFilesService.verifyPassword.mockResolvedValue(true);
      await controller.downloadFile('tok', 'bon', res);
      expect(pipe).toHaveBeenCalledWith(res);
    });
  });
});

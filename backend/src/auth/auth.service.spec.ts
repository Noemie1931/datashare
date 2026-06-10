import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      mockUsersService.create.mockResolvedValue({ id: '123', email: 'test@test.com' });
      const result = await authService.register('test@test.com', 'password123');
      expect(result).toHaveProperty('access_token', 'mock_token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(authService.login('wrong@test.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully and return a token', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: '123',
        email: 'test@test.com',
        password: hash,
      });
      const result = await authService.login('test@test.com', 'password123');
      expect(result).toHaveProperty('access_token', 'mock_token');
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: '123',
        email: 'test@test.com',
        password: hash,
      });
      await expect(authService.login('test@test.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: '123',
    email: 'test@test.com',
    password: 'hashedpassword',
    createdAt: new Date(),
  };

  const mockRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a new user', async () => {
    const user = await service.create('test@test.com', 'password123');
    expect(user.email).toBe('test@test.com');
  });

  it('should throw ConflictException if email already exists', async () => {
    mockRepo.findOne.mockResolvedValueOnce(mockUser);
    await expect(service.create('test@test.com', 'password123'))
      .rejects.toThrow(ConflictException);
  });

  it('should find user by email', async () => {
    mockRepo.findOne.mockResolvedValueOnce(mockUser);
    const user = await service.findByEmail('test@test.com');
    expect(user?.email).toBe('test@test.com');
  });

  it('should find user by id', async () => {
    mockRepo.findOne.mockResolvedValueOnce(mockUser);
    const user = await service.findById('123');
    expect(user?.id).toBe('123');
  });
});
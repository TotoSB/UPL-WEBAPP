import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;
  let configServiceMock: Partial<ConfigService>;

  const mockUser: UserEntity = {
    id: 'test-uuid',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashedPassword', // Importante para el login
    is_active: true,
    is_staff: false,
    is_superuser: false,
    date_joined: new Date(),
    last_updated: new Date(),
    preguntas: [],
    comentarios: [],
  };

  beforeEach(async () => {
    // Inicializar mocks
    usersServiceMock = {
      create: jest.fn(),
      findOneWithPasswordByUsername: jest.fn(),
      findOneWithPasswordByEmail: jest.fn(),
    };
    jwtServiceMock = {
      sign: jest.fn(),
    };
    configServiceMock = { // Mockear ConfigService si es usado directamente por AuthService
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'JWT_EXPIRATION_TIME') return '3600s';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'Password123!',
    };
    const hashedPassword = 'hashedNewPassword';

    it('should register a new user successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      const createdUser = { ...mockUser, username: registerDto.username, email: registerDto.email, id: 'new-uuid' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...expectedUserResponse } = createdUser;
      (usersServiceMock.create as jest.Mock).mockResolvedValue(expectedUserResponse);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersServiceMock.create).toHaveBeenCalledWith({
        username: registerDto.username,
        email: registerDto.email,
        password_hash: hashedPassword,
      });
      expect(result).toEqual(expectedUserResponse);
    });

    it('should throw ConflictException if user/email already exists (via UsersService)', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (usersServiceMock.create as jest.Mock).mockRejectedValue(new ConflictException('Username already exists'));

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

     it('should throw InternalServerErrorException on bcrypt hash error', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));
      await expect(service.register(registerDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    const loginDto: LoginUserDto = { login: 'testuser', password: 'password123' };
    const accessToken = 'testAccessToken';

    it('should login a user and return an access token (with username)', async () => {
      (usersServiceMock.findOneWithPasswordByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtServiceMock.sign as jest.Mock).mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(usersServiceMock.findOneWithPasswordByUsername).toHaveBeenCalledWith(loginDto.login);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password_hash);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ username: mockUser.username, sub: mockUser.id, email: mockUser.email });
      expect(result).toEqual({
        accessToken,
        user: { id: mockUser.id, username: mockUser.username, email: mockUser.email },
      });
    });

    it('should login a user and return an access token (with email)', async () => {
      const loginWithEmailDto: LoginUserDto = { login: 'test@example.com', password: 'password123' };
      (usersServiceMock.findOneWithPasswordByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtServiceMock.sign as jest.Mock).mockReturnValue(accessToken);

      const result = await service.login(loginWithEmailDto);

      expect(usersServiceMock.findOneWithPasswordByEmail).toHaveBeenCalledWith(loginWithEmailDto.login);
      expect(result.accessToken).toEqual(accessToken);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersServiceMock.findOneWithPasswordByUsername as jest.Mock).mockResolvedValue(undefined);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      (usersServiceMock.findOneWithPasswordByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException on bcrypt compare error', async () => {
      (usersServiceMock.findOneWithPasswordByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Compare failed'));
      await expect(service.login(loginDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // TODO: Add tests for validateUserById if it has more complex logic
});

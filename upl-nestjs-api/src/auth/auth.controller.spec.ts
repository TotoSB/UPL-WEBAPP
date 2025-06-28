import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto, LoginResponseDto } from './dto/login-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config'; // Import if JwtAuthGuard or other parts need it indirectly

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthService>;

  const mockUserEntity: UserEntity = {
    id: 'user-uuid',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashed',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    date_joined: new Date(),
    last_updated: new Date(),
    preguntas: [],
    comentarios: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...mockUserResponseData } = mockUserEntity;
  const mockUserResponse: Omit<UserEntity, 'password_hash'> = mockUserResponseData;


  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
      // validateUserById is part of JwtStrategy's path, not directly called by controller usually
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        // Mock ConfigService if any guard or other component loaded with controller needs it.
        // For JwtAuthGuard, it's more about the strategy needing ConfigService, which is tested separately.
        { provide: ConfigService, useValue: { get: jest.fn() } }
      ],
    })
    // Mock JwtAuthGuard: by default, allow access.
    // For testing specific guard logic, you'd test the guard itself.
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'Password123!',
    };

    it('should call authService.register and return the result', async () => {
      (authServiceMock.register as jest.Mock).mockResolvedValue(mockUserResponse);

      const result = await controller.register(registerDto);
      expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('login', () => {
    const loginDto: LoginUserDto = { login: 'testuser', password: 'password' };
    const loginResponse: LoginResponseDto = {
      accessToken: 'test-token',
      user: { id: 'user-uuid', username: 'testuser', email: 'test@example.com' },
    };

    it('should call authService.login and return the result', async () => {
      (authServiceMock.login as jest.Mock).mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);
      expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResponse);
    });
  });

  describe('getProfile', () => {
    const mockRequest = { user: mockUserEntity }; // req.user is populated by JwtAuthGuard/Passport

     const expectedProfileResponse: UserResponseDto = {
        id: mockUserEntity.id,
        username: mockUserEntity.username,
        email: mockUserEntity.email,
        is_active: mockUserEntity.is_active,
        is_staff: mockUserEntity.is_staff,
        is_superuser: mockUserEntity.is_superuser,
        date_joined: mockUserEntity.date_joined,
        last_updated: mockUserEntity.last_updated,
    };


    it('should return user profile data from req.user', () => {
      const result = controller.getProfile(mockRequest);
      // We are transforming the req.user in the controller, so we check the transformed structure
      expect(result).toEqual(expectedProfileResponse);
    });
  });
});

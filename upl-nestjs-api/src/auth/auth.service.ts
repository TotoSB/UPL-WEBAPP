import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto, LoginResponseDto } from './dto/login-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<Omit<UserEntity, 'password_hash'>> {
    const { username, email, password } = registerUserDto;

    // Hashear la contraseña
    const saltRounds = 10; // O configurable desde .env
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      this.logger.error('Error hashing password during registration', error.stack);
      throw new InternalServerErrorException('Error processing registration.');
    }

    try {
      // El UsersService se encarga de verificar conflictos de username/email
      const user = await this.usersService.create({
        username,
        email,
        password_hash: hashedPassword,
      });
      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-lanzar la excepción de conflicto (username/email ya existe)
      }
      this.logger.error(`Failed to register user ${username}`, error.stack);
      throw new InternalServerErrorException('Could not register user.');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { login, password } = loginUserDto;

    let user: UserEntity | undefined;
    // Intentar encontrar por username o email
    if (login.includes('@')) {
        user = await this.usersService.findOneWithPasswordByEmail(login);
    } else {
        user = await this.usersService.findOneWithPasswordByUsername(login);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials (user not found).');
    }

    // Verificar si la cuenta está activa (si implementamos esa lógica)
    // if (!user.is_active) {
    //   throw new UnauthorizedException('Account is not active.');
    // }

    // Verificar contraseña
    let isPasswordMatching = false;
    if (user.password_hash) { // Asegurarse que password_hash no sea null o undefined
        try {
            isPasswordMatching = await bcrypt.compare(password, user.password_hash);
        } catch (error) {
            this.logger.error('Error comparing password during login', error.stack);
            throw new InternalServerErrorException('Error processing login.');
        }
    }


    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials (password mismatch).');
    }

    // Generar JWT
    const payload = { username: user.username, sub: user.id, email: user.email }; // `sub` es el ID del usuario (subject)
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { // Devolver algunos datos del usuario es útil para el frontend
        id: user.id,
        username: user.username,
        email: user.email,
      }
    };
  }

  async validateUserById(userId: string): Promise<UserEntity | null> {
    const user = await this.usersService.findOneById(userId);
    if (user && user.is_active) { // Opcional: verificar si está activo
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user; // No devolver el hash
      return result as UserEntity;
    }
    return null;
  }
}

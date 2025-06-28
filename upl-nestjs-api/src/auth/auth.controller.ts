import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto, LoginResponseDto } from './dto/login-user.dto';
import { UserResponseDto } from '../users/dto/create-user.dto'; // Usaremos este para el perfil
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Crearemos este guard
import { UserEntity } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto): Promise<Omit<UserEntity, 'password_hash'>> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    return this.authService.login(loginUserDto);
  }

  // Ruta de ejemplo para obtener el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req): UserResponseDto {
    // req.user es poblado por JwtStrategy después de validar el token
    // Excluimos la contraseña y otros campos sensibles si es necesario
    const { id, username, email, is_active, is_staff, is_superuser, date_joined, last_updated } = req.user as UserEntity;
    return { id, username, email, is_active, is_staff, is_superuser, date_joined, last_updated };
  }

  // No hay un endpoint de logout explícito para JWT stateless.
  // El cliente simplemente descarta el token.
  // Se podría implementar una blacklist de tokens si se necesita un logout forzado del lado del servidor.
}

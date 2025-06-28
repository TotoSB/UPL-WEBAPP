import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  // Contiene el hash, no la contraseña en texto plano
  // La validación de la contraseña original se hace en RegisterDto en AuthModule
  password_hash: string;
}

// DTO para la respuesta, para no exponer el hash
export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: Date;
  last_updated: Date;
}

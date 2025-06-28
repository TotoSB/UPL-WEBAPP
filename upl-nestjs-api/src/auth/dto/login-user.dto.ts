import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {
  // Permitir login con username o email
  @IsNotEmpty({ message: 'Debe proporcionar un nombre de usuario o email.'})
  @IsString()
  login: string; // Puede ser username o email

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  }
}

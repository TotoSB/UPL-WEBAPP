import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres.' })
  username: string;

  @IsNotEmpty({ message: 'El email no puede estar vacío.' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  // Ejemplo de Regex: al menos una mayúscula, una minúscula, un número y un carácter especial
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
    message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial.',
  })
  password: string;

  // Opcional: para replicar la asignación de grupo de Django
  // @IsOptional()
  // @IsString()
  // group?: string;
}

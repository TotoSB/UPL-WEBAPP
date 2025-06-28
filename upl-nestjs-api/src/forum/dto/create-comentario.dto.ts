import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateComentarioDto {
  @IsNotEmpty({ message: 'El contenido del comentario no puede estar vacío.' })
  @IsString()
  @MinLength(1, { message: 'El comentario debe tener al menos 1 caracter.'})
  contenido: string;

  // pregunta_id se tomará de la URL, autor_id del usuario autenticado
}

// Opcional: DTO para la respuesta
export class ComentarioResponseDto {
  id: string;
  contenido: string;
  fecha_creacion: Date;
  autor: {
    id: string;
    username: string;
  };
  pregunta_id: string;
}

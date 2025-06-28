import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePreguntaDto {
  @IsNotEmpty({ message: 'El contenido de la pregunta no puede estar vacío.' })
  @IsString()
  @MinLength(5, { message: 'La pregunta debe tener al menos 5 caracteres.'})
  contenido: string;
}

// Opcional: DTO para la respuesta, para dar formato o incluir relaciones
export class PreguntaResponseDto {
  id: string;
  contenido: string;
  fecha_creacion: Date;
  autor: { // Solo información relevante del autor
    id: string;
    username: string;
  };
  // comentarios_count?: number; // Podríamos añadir un contador
}

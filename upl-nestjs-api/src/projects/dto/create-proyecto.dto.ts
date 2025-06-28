import { IsNotEmpty, IsString, MaxLength, MinLength, IsOptional, IsUrl } from 'class-validator';

export class CreateProyectoDto {
  @IsNotEmpty({ message: 'El título no puede estar vacío.'})
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.'})
  @MaxLength(100, { message: 'El título no puede exceder los 100 caracteres.'})
  titulo: string;

  @IsNotEmpty({ message: 'La descripción no puede estar vacía.'})
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.'})
  @MaxLength(1900, { message: 'La descripción no puede exceder los 1900 caracteres.'})
  descripcion: string;

  @IsOptional()
  @IsString()
  // @IsUrl({}, { message: 'Debe proporcionar una URL válida para el banner.' })
  // Se puede activar IsUrl si siempre se espera una URL completa.
  // Si se manejan subidas de archivos, esto podría ser un path o un identificador.
  banner_img_url?: string;

  // Opcional: si los proyectos tienen un creador
  // @IsOptional()
  // @IsUUID()
  // creador_id?: string;
}

// DTO para la respuesta, si es necesario
export class ProyectoResponseDto {
  id: string;
  titulo: string;
  descripcion: string;
  banner_img_url: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  // creador?: { id: string, username: string };
}

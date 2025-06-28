import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreguntaEntity } from './entities/pregunta.entity';
import { ComentarioEntity } from './entities/comentario.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreatePreguntaDto } from './dto/create-pregunta.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Injectable()
export class ForumService {
  private readonly logger = new Logger(ForumService.name);

  constructor(
    @InjectRepository(PreguntaEntity)
    private readonly preguntaRepository: Repository<PreguntaEntity>,
    @InjectRepository(ComentarioEntity)
    private readonly comentarioRepository: Repository<ComentarioEntity>,
  ) {}

  async createPregunta(createPreguntaDto: CreatePreguntaDto, autor: UserEntity): Promise<PreguntaEntity> {
    try {
      const pregunta = this.preguntaRepository.create({
        ...createPreguntaDto,
        autor, // Asigna la entidad UserEntity completa
      });
      return await this.preguntaRepository.save(pregunta);
    } catch (error) {
      this.logger.error(`Failed to create pregunta for user ${autor.username}`, error.stack);
      throw new InternalServerErrorException('Could not create pregunta.');
    }
  }

  async findAllPreguntas(page: number = 1, limit: number = 10): Promise<{ data: PreguntaEntity[], count: number }> {
    const [data, count] = await this.preguntaRepository.findAndCount({
      relations: ['autor', 'comentarios'], // Cargar autor y comentarios (o solo contador de comentarios)
      order: { fecha_creacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    // Podríamos transformar la respuesta para incluir solo el nombre de usuario del autor, etc.
    return { data, count };
  }

  async findPreguntaById(id: string): Promise<PreguntaEntity> {
    const pregunta = await this.preguntaRepository.findOne({
      where: { id },
      relations: ['autor', 'comentarios', 'comentarios.autor'], // Cargar relaciones anidadas
    });
    if (!pregunta) {
      throw new NotFoundException(`Pregunta with ID ${id} not found.`);
    }
    return pregunta;
  }

  async createComentario(
    preguntaId: string,
    createComentarioDto: CreateComentarioDto,
    autor: UserEntity,
  ): Promise<ComentarioEntity> {
    const pregunta = await this.findPreguntaById(preguntaId); // Valida que la pregunta exista
    if (!pregunta) {
        throw new NotFoundException(`Cannot add comment: Pregunta with ID ${preguntaId} not found.`);
    }

    try {
      const comentario = this.comentarioRepository.create({
        ...createComentarioDto,
        pregunta,
        autor,
      });
      return await this.comentarioRepository.save(comentario);
    } catch (error) {
        this.logger.error(`Failed to create comentario for pregunta ${preguntaId} by user ${autor.username}`, error.stack);
        throw new InternalServerErrorException('Could not create comentario.');
    }
  }

  async findComentariosByPreguntaId(preguntaId: string, page: number = 1, limit: number = 10): Promise<{data: ComentarioEntity[], count: number}> {
    const preguntaExists = await this.preguntaRepository.findOne({ where: { id: preguntaId } });
    if (!preguntaExists) {
        throw new NotFoundException(`Pregunta with ID ${preguntaId} not found.`);
    }

    const [data, count] = await this.comentarioRepository.findAndCount({
      where: { pregunta: { id: preguntaId } },
      relations: ['autor'],
      order: { fecha_creacion: 'ASC' }, // O 'DESC' según preferencia
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, count };
  }

  // Opcional: Métodos para actualizar/eliminar preguntas y comentarios con verificación de permisos
  async deletePregunta(preguntaId: string, currentUser: UserEntity): Promise<void> {
    const pregunta = await this.findPreguntaById(preguntaId); // Incluye autor
    if (pregunta.autor_id !== currentUser.id && !currentUser.is_superuser) { // Asumiendo que UserEntity tiene is_superuser
        throw new ForbiddenException('You are not allowed to delete this pregunta.');
    }
    await this.preguntaRepository.remove(pregunta);
  }

  async deleteComentario(comentarioId: string, currentUser: UserEntity): Promise<void> {
    const comentario = await this.comentarioRepository.findOne({ where: {id: comentarioId}, relations: ['autor']});
    if (!comentario) {
        throw new NotFoundException(`Comentario with ID ${comentarioId} not found.`);
    }
    if (comentario.autor_id !== currentUser.id && !currentUser.is_superuser) {
        throw new ForbiddenException('You are not allowed to delete this comentario.');
    }
    await this.comentarioRepository.remove(comentario);
  }
}

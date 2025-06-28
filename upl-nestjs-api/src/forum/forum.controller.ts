import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreatePreguntaDto, PreguntaResponseDto } from './dto/create-pregunta.dto';
import { CreateComentarioDto, ComentarioResponseDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity'; // Para tipar req.user
import { PreguntaEntity } from './entities/pregunta.entity';
import { ComentarioEntity } from './entities/comentario.entity';

// Helper para mapear entidades a DTOs de respuesta (ejemplo)
function mapPreguntaToResponseDto(pregunta: PreguntaEntity): PreguntaResponseDto {
  return {
    id: pregunta.id,
    contenido: pregunta.contenido,
    fecha_creacion: pregunta.fecha_creacion,
    autor: {
      id: pregunta.autor.id,
      username: pregunta.autor.username,
    },
    // comentarios_count: pregunta.comentarios ? pregunta.comentarios.length : 0,
  };
}

function mapComentarioToResponseDto(comentario: ComentarioEntity): ComentarioResponseDto {
  return {
    id: comentario.id,
    contenido: comentario.contenido,
    fecha_creacion: comentario.fecha_creacion,
    autor: {
      id: comentario.autor.id,
      username: comentario.autor.username,
    },
    pregunta_id: comentario.pregunta_id,
  };
}


@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // --- Preguntas ---
  @UseGuards(JwtAuthGuard)
  @Post('preguntas')
  @HttpCode(HttpStatus.CREATED)
  async createPregunta(
    @Body() createPreguntaDto: CreatePreguntaDto,
    @Request() req,
  ): Promise<PreguntaResponseDto> {
    const autor = req.user as UserEntity;
    const pregunta = await this.forumService.createPregunta(createPreguntaDto, autor);
    // Aquí podrías mapear la entidad a un DTO de respuesta si es diferente
    return mapPreguntaToResponseDto(pregunta);
  }

  @Get('preguntas')
  @HttpCode(HttpStatus.OK)
  async findAllPreguntas(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: PreguntaResponseDto[], count: number }> {
    const { data, count } = await this.forumService.findAllPreguntas(page, limit);
    return { data: data.map(mapPreguntaToResponseDto), count };
  }

  @Get('preguntas/:id')
  @HttpCode(HttpStatus.OK)
  async findPreguntaById(@Param('id', ParseUUIDPipe) id: string): Promise<PreguntaResponseDto> {
    const pregunta = await this.forumService.findPreguntaById(id);
    // Mapear también los comentarios si se devuelven con la pregunta
    return mapPreguntaToResponseDto(pregunta);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('preguntas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePregunta(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    const currentUser = req.user as UserEntity;
    await this.forumService.deletePregunta(id, currentUser);
  }

  // --- Comentarios ---
  @UseGuards(JwtAuthGuard)
  @Post('preguntas/:preguntaId/comentarios')
  @HttpCode(HttpStatus.CREATED)
  async createComentario(
    @Param('preguntaId', ParseUUIDPipe) preguntaId: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @Request() req,
  ): Promise<ComentarioResponseDto> {
    const autor = req.user as UserEntity;
    const comentario = await this.forumService.createComentario(preguntaId, createComentarioDto, autor);
    return mapComentarioToResponseDto(comentario);
  }

  @Get('preguntas/:preguntaId/comentarios')
  @HttpCode(HttpStatus.OK)
  async findComentariosByPreguntaId(
    @Param('preguntaId', ParseUUIDPipe) preguntaId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: ComentarioResponseDto[], count: number }> {
    const {data, count} = await this.forumService.findComentariosByPreguntaId(preguntaId, page, limit);
    return { data: data.map(mapComentarioToResponseDto), count };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comentarios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComentario(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    const currentUser = req.user as UserEntity;
    await this.forumService.deleteComentario(id, currentUser);
  }
}

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
  Patch, // o Put
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Para subida de archivos
import { ProjectsService } from './projects.service';
import { CreateProyectoDto, ProyectoResponseDto } from './dto/create-proyecto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { ProyectoEntity } from './entities/proyecto.entity';
// import { diskStorage } from 'multer'; // Para configurar almacenamiento local de archivos
// import { extname } from 'path'; // Para obtener extensión de archivo

// Helper para mapear entidad a DTO de respuesta
function mapProyectoToResponseDto(proyecto: ProyectoEntity): ProyectoResponseDto {
  return {
    id: proyecto.id,
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    banner_img_url: proyecto.banner_img_url,
    fecha_creacion: proyecto.fecha_creacion,
    fecha_actualizacion: proyecto.fecha_actualizacion,
    // creador: proyecto.creador ? { id: proyecto.creador.id, username: proyecto.creador.username } : undefined,
  };
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Asumimos que solo usuarios autenticados (y quizás con roles específicos) pueden crear/modificar proyectos.
  // Descomentar JwtAuthGuard y la lógica de permisos en el servicio si es necesario.
  // @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProyectoDto: CreateProyectoDto,
    // @Request() req,
  ): Promise<ProyectoResponseDto> {
    // const currentUser = req.user as UserEntity;
    const proyecto = await this.projectsService.create(createProyectoDto /*, currentUser */);
    return mapProyectoToResponseDto(proyecto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: ProyectoResponseDto[], count: number }> {
    const { data, count } = await this.projectsService.findAll(page, limit);
    return { data: data.map(mapProyectoToResponseDto), count };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id', ParseUUIDPipe) id: string): Promise<ProyectoResponseDto> {
    const proyecto = await this.projectsService.findOneById(id);
    return mapProyectoToResponseDto(proyecto);
  }

  // @UseGuards(JwtAuthGuard)
  @Patch(':id') // Usar PATCH para actualizaciones parciales, PUT para reemplazo total
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProyectoDto: CreateProyectoDto, // Podría ser un UpdateProyectoDto si los campos son diferentes
    // @Request() req,
  ): Promise<ProyectoResponseDto> {
    // const currentUser = req.user as UserEntity;
    const proyecto = await this.projectsService.update(id, updateProyectoDto /*, currentUser */);
    return mapProyectoToResponseDto(proyecto);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    // @Request() req,
  ): Promise<void> {
    // const currentUser = req.user as UserEntity;
    await this.projectsService.remove(id /*, currentUser */);
  }

  // --- Endpoint para subir imagen de banner (ejemplo con almacenamiento local) ---
  // Esto es una simplificación. En producción, se usaría S3 o similar.
  // Se necesitaría configurar MulterModule globalmente o aquí.
  /*
  @UseGuards(JwtAuthGuard)
  @Post(':id/banner')
  @UseInterceptors(FileInterceptor('bannerImage', { // 'bannerImage' es el nombre del campo en el form-data
    storage: diskStorage({
      destination: './uploads/project_banners', // Directorio donde se guardan las imágenes
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 5, // 5 MB
    }
  }))
  async uploadBannerImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File, // Necesita `npm install --save-dev @types/multer`
    // @Request() req, // Para permisos
  ): Promise<ProyectoResponseDto> {
    if (!file) {
      throw new BadRequestException('Banner image file is required.');
    }
    // const currentUser = req.user as UserEntity;
    // Aquí se verificarían permisos para actualizar este proyecto.

    // El path relativo o URL completa dependerá de cómo se sirvan los archivos estáticos.
    // Por ejemplo, si './uploads' se sirve estáticamente como '/static',
    // la URL podría ser '/static/project_banners/${file.filename}'.
    const imageUrl = `/uploads/project_banners/${file.filename}`;

    const proyecto = await this.projectsService.updateBannerImageUrl(id, imageUrl);
    return mapProyectoToResponseDto(proyecto);
  }
  */
}

import { Injectable, NotFoundException, InternalServerErrorException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProyectoEntity } from './entities/proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UserEntity } from '../users/entities/user.entity'; // Para permisos

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(ProyectoEntity)
    private readonly proyectoRepository: Repository<ProyectoEntity>,
  ) {}

  async create(createProyectoDto: CreateProyectoDto /*, currentUser: UserEntity */): Promise<ProyectoEntity> {
    // Aquí se podría añadir lógica de permisos, ej:
    // if (!currentUser.is_staff && !currentUser.is_superuser) {
    //   throw new ForbiddenException('You are not allowed to create projects.');
    // }

    try {
      const proyecto = this.proyectoRepository.create({
        ...createProyectoDto,
        // creador: currentUser, // Si los proyectos tienen creador
      });
      return await this.proyectoRepository.save(proyecto);
    } catch (error) {
      this.logger.error(`Failed to create proyecto. DTO: ${JSON.stringify(createProyectoDto)}`, error.stack);
      throw new InternalServerErrorException('Could not create proyecto.');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ProyectoEntity[], count: number }> {
    const [data, count] = await this.proyectoRepository.findAndCount({
      order: { fecha_creacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      // relations: ['creador'] // Si hay relación con creador
    });
    return { data, count };
  }

  async findOneById(id: string): Promise<ProyectoEntity> {
    const proyecto = await this.proyectoRepository.findOne({
        where: { id },
        // relations: ['creador']
    });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto with ID ${id} not found.`);
    }
    return proyecto;
  }

  async update(id: string, updateProyectoDto: CreateProyectoDto /*, currentUser: UserEntity */): Promise<ProyectoEntity> {
    // Permisos: Solo staff/superuser o el creador del proyecto pueden actualizar
    const proyecto = await this.findOneById(id); // Esto ya lanza NotFoundException si no existe
    // if (proyecto.creador_id !== currentUser.id && !currentUser.is_staff && !currentUser.is_superuser) {
    //   throw new ForbiddenException('You are not allowed to update this project.');
    // }

    // Object.assign(proyecto, updateProyectoDto); // Actualiza los campos del proyecto encontrado
    // TypeORM Partial Update:
    try {
        await this.proyectoRepository.update(id, updateProyectoDto);
        return this.findOneById(id); // Devolver la entidad actualizada
    } catch (error) {
        this.logger.error(`Failed to update proyecto with ID ${id}. DTO: ${JSON.stringify(updateProyectoDto)}`, error.stack);
        throw new InternalServerErrorException('Could not update proyecto.');
    }
  }

  async remove(id: string /*, currentUser: UserEntity */): Promise<void> {
    // Permisos: Solo staff/superuser o el creador del proyecto pueden eliminar
    const proyecto = await this.findOneById(id);
    // if (proyecto.creador_id !== currentUser.id && !currentUser.is_staff && !currentUser.is_superuser) {
    //   throw new ForbiddenException('You are not allowed to delete this project.');
    // }

    const result = await this.proyectoRepository.delete(id);
    if (result.affected === 0) {
      // Esto no debería pasar si findOneById tuvo éxito, pero es una doble verificación
      throw new NotFoundException(`Proyecto with ID ${id} not found for deletion.`);
    }
  }

  // Lógica para manejo de subida de archivos (banner_img_url)
  // Esto es un placeholder. La implementación real dependerá de la estrategia elegida
  // (local, S3, etc.). Podría estar en un servicio separado (UploadsService).
  async updateBannerImageUrl(id: string, imageUrl: string): Promise<ProyectoEntity> {
    const proyecto = await this.findOneById(id);
    proyecto.banner_img_url = imageUrl;
    try {
        return await this.proyectoRepository.save(proyecto);
    } catch (error) {
        this.logger.error(`Failed to update banner image URL for proyecto ${id}`, error.stack);
        throw new InternalServerErrorException('Could not update banner image URL.');
    }
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProyectoEntity } from './entities/proyecto.entity';
import { AuthModule } from '../auth/auth.module'; // Para JwtAuthGuard y req.user
import { UsersModule } from '../users/users.module'; // Para UserEntity
// import { MulterModule } from '@nestjs/platform-express'; // Para subida de archivos

@Module({
  imports: [
    TypeOrmModule.forFeature([ProyectoEntity]),
    AuthModule,
    UsersModule,
    // Opcional: Configuración de Multer para subida de archivos
    // MulterModule.register({
    //   dest: './uploads', // Directorio por defecto para archivos subidos
    // }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}

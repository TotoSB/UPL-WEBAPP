import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { PreguntaEntity } from './entities/pregunta.entity';
import { ComentarioEntity } from './entities/comentario.entity';
import { AuthModule } from '../auth/auth.module'; // Para JwtAuthGuard y req.user
import { UsersModule } from '../users/users.module'; // Para UserEntity

@Module({
  imports: [
    TypeOrmModule.forFeature([PreguntaEntity, ComentarioEntity]),
    AuthModule, // Importar AuthModule para usar JwtAuthGuard y acceder a req.user
    UsersModule, // Para asegurar que UserEntity esté disponible si es necesario
  ],
  controllers: [ForumController],
  providers: [ForumService],
})
export class ForumModule {}

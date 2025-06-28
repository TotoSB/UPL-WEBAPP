import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
// No necesitamos un UsersController si la gestión de usuarios se hace a través de AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  exports: [UsersService], // Exportar UsersService para que AuthModule pueda usarlo
})
export class UsersModule {}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // Crearemos este DTO

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<UserEntity, 'password_hash'>> {
    const { username, email, password_hash } = createUserDto;

    // Verificar si el usuario o email ya existen
    const existingUserByUsername = await this.userRepository.findOne({ where: { username } });
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    const existingUserByEmail = await this.userRepository.findOne({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      username,
      email,
      password_hash, // El hash ya viene del AuthService
      is_active: true, // Activar por defecto o enviar email de confirmación
    });

    await this.userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user; // Excluir password_hash de la respuesta
    return result;
  }

  async findOneByUsername(username: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findOneById(id: string): Promise<UserEntity | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Podríamos añadir métodos para actualizar usuario, etc.
  // También un método para obtener el usuario con su contraseña (usado internamente por AuthService)
  async findOneWithPasswordByUsername(username: string): Promise<UserEntity | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash') // Asegurarse de seleccionar el campo password_hash
      .where('user.username = :username', { username })
      .getOne();
  }

  async findOneWithPasswordByEmail(email: string): Promise<UserEntity | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PreguntaEntity } from '../../forum/entities/pregunta.entity';
import { ComentarioEntity } from '../../forum/entities/comentario.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 254, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password_hash: string; // Almacenará la contraseña hasheada

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_staff: boolean; // Similar a is_staff en Django

  @Column({ type: 'boolean', default: false })
  is_superuser: boolean; // Similar a is_superuser en Django

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date_joined: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  last_updated: Date;

  // Relaciones (ejemplos, se crearán estas entidades después)
  @OneToMany(() => PreguntaEntity, (pregunta) => pregunta.autor)
  preguntas: PreguntaEntity[];

  @OneToMany(() => ComentarioEntity, (comentario) => comentario.autor)
  comentarios: ComentarioEntity[];

  // Podríamos añadir campos como first_name, last_name si son necesarios
  // y una relación ManyToMany para 'groups' si replicamos esa funcionalidad.
}

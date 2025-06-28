import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ComentarioEntity } from './comentario.entity';

@Entity({ name: 'forum_preguntas' })
export class PreguntaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  contenido: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @ManyToOne(() => UserEntity, (user) => user.preguntas, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'autor_id' }) // Especifica el nombre de la columna FK
  autor: UserEntity;

  @Column() // TypeORM necesita esta columna para la relación, incluso si no la usas directamente
  autor_id: string;

  @OneToMany(() => ComentarioEntity, (comentario) => comentario.pregunta)
  comentarios: ComentarioEntity[];
}

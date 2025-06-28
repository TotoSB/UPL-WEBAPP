import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PreguntaEntity } from './pregunta.entity';

@Entity({ name: 'forum_comentarios' })
export class ComentarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  contenido: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @ManyToOne(() => UserEntity, (user) => user.comentarios, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'autor_id' })
  autor: UserEntity;

  @Column()
  autor_id: string;

  @ManyToOne(() => PreguntaEntity, (pregunta) => pregunta.comentarios, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pregunta_id' })
  pregunta: PreguntaEntity;

  @Column()
  pregunta_id: string;
}

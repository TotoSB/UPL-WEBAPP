import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'proyectos' })
export class ProyectoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false }) // Aumentado de 50 a 100 por si acaso
  titulo: string;

  @Column({ type: 'varchar', length: 1900, nullable: false })
  descripcion: string;

  @Column({ type: 'varchar', nullable: true }) // Almacenará la URL o path del banner
  banner_img_url: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  fecha_actualizacion: Date;

  // Podríamos añadir una relación a un UserEntity si los proyectos tienen un autor/creador.
  // @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' }) // Ejemplo
  // @JoinColumn({ name: 'creador_id' })
  // creador?: UserEntity;

  // @Column({ type: 'uuid', nullable: true })
  // creador_id?: string;
}

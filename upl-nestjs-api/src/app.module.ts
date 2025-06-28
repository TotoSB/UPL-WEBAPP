import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ForumModule } from './forum/forum.module';
import { ProjectsModule } from './projects/projects.module';
// Entity imports will be added here as they are created
// For TypeORM synchronize or migrations to find entities, they need to be listed or auto-loaded.

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env', // Carga .env o .env.test
      // Si no se encuentra .env, las variables de entorno del sistema (ej. de Docker) se usarán.
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        // Cargar entidades automáticamente. Asegúrate que las rutas sean correctas.
        // Esto es más conveniente que listar cada entidad manualmente.
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // true en desarrollo/test. Usar migraciones en producción.
        logging: configService.get<string>('NODE_ENV') !== 'production',
        autoLoadEntities: true, // Ayuda a TypeORM a descubrir entidades en los módulos
        // Para producción, se recomienda usar migraciones:
        // migrationsTableName: 'migrations',
        // migrations: ['dist/migrations/*{.ts,.js}'],
        // cli: {
        //   migrationsDir: 'src/migrations',
        // },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ForumModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

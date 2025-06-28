import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Asegúrate que la ruta sea correcta
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../src/users/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<UserEntity>;

  // Generar datos de usuario únicos para cada prueba
  const uniqueUsername = `testuser_e2e_${Date.now()}`;
  const uniqueEmail = `test_e2e_${Date.now()}@example.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // Permite anular la configuración de la base de datos para usar una base de datos de prueba si es necesario
    // .overrideProvider(getDataSourceToken()) // o TypeOrmModuleOptions
    // .useFactory({
    //   factory: (configService: ConfigService) => { /* ... config de BD de prueba ... */ },
    //   inject: [ConfigService],
    // })
    .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1'); // Asegúrate que coincida con tu main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    await app.init();

    // Obtener instancia de DataSource y repositorio para limpieza
    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(UserEntity);
  });

  // Limpiar la base de datos después de cada prueba o suite
  afterEach(async () => {
    // Eliminar el usuario creado para evitar conflictos entre pruebas
    try {
      const user = await userRepository.findOne({ where: [{ email: uniqueEmail }, {username: uniqueUsername}] });
      if (user) {
        await userRepository.remove(user);
      }
    } catch (error) {
      // console.error("Error cleaning up user:", error);
    }
  });

  afterAll(async () => {
    await app.close();
    if (dataSource && dataSource.isInitialized) {
      // await dataSource.destroy(); // Cerrar la conexión a la BD si se abrió específicamente para pruebas
    }
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: uniqueUsername,
          email: uniqueEmail,
          password: password,
        })
        .expect(201) // HttpStatus.CREATED
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.username).toEqual(uniqueUsername);
          expect(res.body.email).toEqual(uniqueEmail);
          expect(res.body.id).toBeDefined();
          expect(res.body.password_hash).toBeUndefined(); // No debería devolver el hash
        });
    });

    it('should fail to register if username already exists', async () => {
      // Primero, registrar un usuario
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: `${uniqueUsername}_conflict`,
          email: `another_${uniqueEmail}`,
          password: password,
        })
        .expect(201);

      // Intentar registrar con el mismo username
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: `${uniqueUsername}_conflict`, // Mismo username
          email: `yet_another_${uniqueEmail}`,
          password: password,
        })
        .expect(409) // HttpStatus.CONFLICT
        .expect((res) => {
          expect(res.body.message).toContain('Username already exists');
        });
    });

    it('should fail with invalid data (e.g., short password)', () => {
        return request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
                username: `shortpass_${uniqueUsername}`,
                email: `shortpass_${uniqueEmail}`,
                password: '123', // Contraseña corta
            })
            .expect(400) // HttpStatus.BAD_REQUEST (debido a ValidationPipe)
            .expect((res) => {
                expect(res.body.message).toBeInstanceOf(Array);
                expect(res.body.message[0]).toContain('La contraseña debe tener al menos 8 caracteres.');
            });
    });
  });

  describe('/auth/login (POST) and /auth/profile (GET)', () => {
    let authToken = '';

    beforeAll(async () => {
      // Registrar un usuario para las pruebas de login y profile
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: uniqueUsername,
          email: uniqueEmail,
          password: password,
        })
        .expect(201);
    });

    it('should login the registered user and return a JWT', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          login: uniqueUsername, // o uniqueEmail
          password: password,
        })
        .expect(200) // HttpStatus.OK
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.username).toEqual(uniqueUsername);
          authToken = res.body.accessToken; // Guardar token para la siguiente prueba
        });
    });

    it('should fail to login with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          login: uniqueUsername,
          password: 'wrongpassword',
        })
        .expect(401); // HttpStatus.UNAUTHORIZED
    });

    it('should fail to login with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          login: 'nonexistentuser_e2e',
          password: password,
        })
        .expect(401); // HttpStatus.UNAUTHORIZED
    });

    it('/auth/profile (GET) should return user profile with valid JWT', () => {
      if (!authToken) {
        throw new Error('Auth token not available for profile test. Login test might have failed.');
      }
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.username).toEqual(uniqueUsername);
          expect(res.body.email).toEqual(uniqueEmail);
          expect(res.body.id).toBeDefined();
        });
    });

    it('/auth/profile (GET) should fail without JWT', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401); // HttpStatus.UNAUTHORIZED
    });

    it('/auth/profile (GET) should fail with an invalid/expired JWT', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer aninvalidtoken`)
        .expect(401); // HttpStatus.UNAUTHORIZED
    });
  });
});

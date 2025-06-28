# UPL NestJS API

API para la aplicación UPL, migrada desde un proyecto Django original. Esta API está construida con NestJS, TypeORM y PostgreSQL, y está diseñada para ser dockerizada.

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Prerrequisitos](#prerrequisitos)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
  - [Variables de Entorno](#variables-de-entorno)
  - [Levantar con Docker Compose](#levantar-con-docker-compose)
- [Ejecutar la Aplicación (sin Docker, para desarrollo local avanzado)](#ejecutar-la-aplicación-sin-docker)
- [Ejecutar Pruebas](#ejecutar-pruebas)
  - [Pruebas Unitarias](#pruebas-unitarias)
  - [Pruebas End-to-End (E2E)](#pruebas-end-to-end-e2e)
- [Migraciones de Base de Datos (TypeORM)](#migraciones-de-base-de-datos-typeorm)
- [Documentación de la API (Swagger/OpenAPI)](#documentación-de-la-api-swaggeropenapi)
- [Consideraciones de Despliegue](#consideraciones-de-despliegue)

## Visión General

Esta API proporciona los servicios backend para la plataforma UPL, incluyendo:
- Autenticación de usuarios (registro, login) con JWT.
- Funcionalidades de foro (crear y listar preguntas y comentarios).
- Gestión de propuestas/proyectos.

## Características

- API RESTful.
- Autenticación basada en JWT.
- CRUD para Preguntas, Comentarios y Proyectos.
- Configuración para Docker y Docker Compose.
- Validación de datos de entrada.
- Pruebas unitarias y E2E (ejemplos).

## Tecnologías Utilizadas

- **Backend:** NestJS (TypeScript)
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** Passport.js con estrategia JWT (passport-jwt)
- **Contenerización:** Docker, Docker Compose
- **Pruebas:** Jest, Supertest
- **Linting/Formatting:** ESLint, Prettier

## Estructura del Proyecto

El proyecto NestJS sigue la estructura estándar generada por Nest CLI:

\`\`\`
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/               # Módulo de Autenticación
├── users/              # Módulo de Usuarios
├── forum/              # Módulo de Foro (Preguntas, Comentarios)
├── projects/           # Módulo de Proyectos
├── migrations/         # Migraciones de TypeORM (generadas)
└── data-source.ts      # Configuración de DataSource para TypeORM CLI
test/
├── app.e2e-spec.ts     # Pruebas E2E generales
└── auth.e2e-spec.ts    # Pruebas E2E para autenticación
└── jest-e2e.json       # Configuración de Jest para E2E
.env.example            # Ejemplo de variables de entorno
Dockerfile              # Para construir la imagen Docker de la API
docker-compose.yml      # Para orquestar servicios (API, Base de Datos)
package.json
tsconfig.json
README.md
... (otros archivos de configuración)
\`\`\`

## Prerrequisitos

- Docker y Docker Compose instalados.
- Node.js y npm (si se quiere ejecutar fuera de Docker para desarrollo avanzado).

## Configuración del Entorno de Desarrollo

### Variables de Entorno

1.  Copie el archivo `.env.example` a un nuevo archivo llamado `.env` en la raíz del directorio `upl-nestjs-api/`:
    \`cp .env.example .env\`
2.  Modifique las variables en `.env` según su configuración local, especialmente:
    -   `DB_PASSWORD`
    -   `JWT_SECRET` (debe ser una cadena larga y segura)

    **Nota:** Las variables de entorno definidas en `docker-compose.yml` para los servicios `api` y `db` tendrán precedencia cuando se ejecute dentro de Docker si no se especifica un `env_file` en `docker-compose.yml` que apunte al `.env` local, o si las variables están directamente en la sección `environment` de `docker-compose.yml`. El `docker-compose.yml` actual ya define estas variables.

### Levantar con Docker Compose

Esta es la forma recomendada para levantar el entorno de desarrollo completo (API y base de datos PostgreSQL).

1.  Desde la raíz del repositorio (donde está `docker-compose.yml`):
    \`\`\`bash
    docker-compose up --build
    \`\`\`
    -   `--build` reconstruirá las imágenes si hay cambios en el `Dockerfile` o el código fuente.
    -   La API estará disponible en `http://localhost:API_PORT` (por defecto `http://localhost:3000`).
    -   La base de datos PostgreSQL estará accesible en el puerto `DB_PORT` (por defecto `5432`) en el host, pero la API se conectará a ella usando el nombre de servicio `db` dentro de la red Docker.

2.  Para detener los servicios:
    \`\`\`bash
    docker-compose down
    \`\`\`

## Ejecutar la Aplicación (sin Docker, para desarrollo local avanzado)

Esto asume que tienes Node.js (v18+ recomendado) y npm instalados en tu máquina, y una instancia de PostgreSQL corriendo y accesible.

1.  Navegue al directorio `upl-nestjs-api/`.
2.  Instale dependencias:
    \`\`\`bash
    npm install
    \`\`\`
3.  Asegúrese que su archivo `.env` esté configurado para apuntar a su instancia local de PostgreSQL.
4.  Ejecute la aplicación en modo desarrollo (con hot-reloading):
    \`\`\`bash
    npm run start:dev
    \`\`\`
    La API estará disponible en `http://localhost:API_PORT`.

## Ejecutar Pruebas

Las pruebas se ejecutan dentro del contexto del proyecto NestJS (`upl-nestjs-api/`).

### Pruebas Unitarias

\`\`\`bash
# Desde upl-nestjs-api/
npm test
\`\`\`

### Pruebas End-to-End (E2E)

Las pruebas E2E requieren que la base de datos (definida en `docker-compose.yml` o una instancia de prueba) esté accesible. Si usa Docker, asegúrese que los servicios estén corriendo.

\`\`\`bash
# Desde upl-nestjs-api/
npm run test:e2e
\`\`\`
**Nota:** Las pruebas E2E actuales pueden modificar la base de datos. Están diseñadas para limpiar los datos específicos que crean, pero es mejor ejecutarlas contra una base de datos de desarrollo/prueba.

## Migraciones de Base de Datos (TypeORM)

Para producción, y para gestionar cambios de esquema de forma controlada en desarrollo, se usan migraciones de TypeORM.
(Asegúrese de tener `src/data-source.ts` configurado correctamente y las variables de entorno de BD disponibles para la CLI).

1.  **Generar una nueva migración después de cambios en las entidades:**
    (Reemplace `NombreDeLaMigracion` con un nombre descriptivo)
    \`\`\`bash
    # Desde upl-nestjs-api/
    npm run migration:generate -- src/migrations/NombreDeLaMigracion
    \`\`\`

2.  **Ejecutar migraciones pendientes:**
    Esto aplicará todas las migraciones que aún no se han ejecutado en la base de datos.
    \`\`\`bash
    # Desde upl-nestjs-api/
    npm run migration:run
    \`\`\`

3.  **Revertir la última migración ejecutada:**
    \`\`\`bash
    # Desde upl-nestjs-api/
    npm run migration:revert
    \`\`\`

## Documentación de la API (Swagger/OpenAPI)

Para generar documentación interactiva de la API con Swagger:

1.  **Instalar dependencias (si no se pudo hacer antes):**
    \`\`\`bash
    # Desde upl-nestjs-api/
    npm install --save @nestjs/swagger swagger-ui-express
    \`\`\`

2.  **Configurar Swagger en `src/main.ts`:**
    \`\`\`typescript
    // En src/main.ts, dentro de la función bootstrap()

    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

    // ...
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      // ... otras configuraciones de app (prefijo global, pipes, cors) ...

      const config = new DocumentBuilder()
        .setTitle('UPL API')
        .setDescription('Documentación de la API para la aplicación UPL')
        .setVersion('1.0')
        .addBearerAuth() // Para endpoints protegidos con JWT
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document); // UI de Swagger en /api-docs

      // ... app.listen() ...
    }
    bootstrap();
    \`\`\`
    Con esta configuración, la UI de Swagger estaría disponible en `http://localhost:API_PORT/api-docs` cuando la aplicación esté corriendo.

## Consideraciones de Despliegue

- **NODE_ENV:** Asegúrese que `NODE_ENV` esté configurado a `production` en el entorno de despliegue.
- **Variables de Entorno:** Gestione las variables de entorno de producción de forma segura (no las suba al control de versiones).
- **Base de Datos:** Use una instancia de PostgreSQL robusta y gestionada para producción.
- **Migraciones:** Ejecute las migraciones de TypeORM (`npm run migration:run`) como parte de su pipeline de despliegue antes de iniciar la nueva versión de la aplicación. `synchronize: true` de TypeORM NO debe usarse en producción.
- **Seguridad:**
    - Use HTTPS (ej. con un proxy inverso como Nginx).
    - Configure Headers de Seguridad (ej. con Helmet: `app.use(helmet())`).
    - Implemente Limitación de Tasa (Rate Limiting, ej. `@nestjs/throttler`).
    - Restrinja CORS a los dominios del frontend de producción.
- **Logging:** Configure un sistema de logging robusto para producción.
- **Orquestación:** Para despliegues escalables y resilientes, considere usar orquestadores de contenedores como Kubernetes.
- **Servir Frontend SPA:** Compile la SPA y sirva los archivos estáticos resultantes a través de un CDN o un servidor web (Nginx).

Este README proporciona una guía básica. Consulte la documentación oficial de NestJS y otras tecnologías para más detalles.

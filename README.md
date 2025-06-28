# Migración de Proyecto Django a NestJS y Docker

Este repositorio documenta y contiene la migración de un proyecto web originalmente desarrollado en Django a una arquitectura moderna utilizando NestJS (TypeScript) para el backend, PostgreSQL como base de datos, y Docker para la contenerización.

## Descripción General

El objetivo de este proyecto fue tomar una aplicación Django existente y transformarla en una API RESTful robusta y escalable con NestJS, manteniendo la funcionalidad principal y preparando el terreno para un frontend desacoplado (por ejemplo, una Single Page Application).

## Contenido del Repositorio

El repositorio está estructurado de la siguiente manera:

### 1. Proyecto Django Original

-   **Ubicación:** Los archivos del proyecto Django original se encuentran principalmente en los directorios `UPL/` (configuración del proyecto Django) y `app/` (la aplicación Django principal con modelos, vistas, templates, etc.).
-   **Base de Datos Original:** Utilizaba `db.sqlite3`.
-   **Dependencias:** Listadas en `requirements.txt`.

### 2. Nuevo Proyecto NestJS (API Backend)

-   **Ubicación:** El nuevo backend desarrollado en NestJS se encuentra íntegramente dentro del directorio `upl-nestjs-api/`.
-   **Características:**
    -   Escrito en TypeScript.
    -   Utiliza el framework NestJS.
    -   ORM: TypeORM.
    -   Base de Datos: PostgreSQL.
    -   Autenticación: Basada en JWT (JSON Web Tokens).
    -   Contenerización: Configurado con `Dockerfile` y `docker-compose.yml`.
-   **Documentación Detallada:** Para instrucciones sobre cómo configurar, ejecutar, probar y desplegar la API NestJS, por favor consulte el README específico dentro de su directorio:
    -   [**upl-nestjs-api/README.md**](./upl-nestjs-api/README.md)

### 3. Configuración de Docker

-   `Dockerfile`: Define la imagen para la aplicación NestJS (ubicado en `upl-nestjs-api/Dockerfile` pero referenciado desde el `docker-compose.yml` raíz).
    *Corrección: El Dockerfile está en la raíz, al igual que docker-compose.yml.*
-   `docker-compose.yml`: Orquesta los servicios de la API NestJS y la base de datos PostgreSQL (ubicado en la raíz del repositorio).
-   `.dockerignore`: Especifica los archivos a ignorar al construir la imagen Docker (ubicado en la raíz).

## Estado de la Migración

La migración del backend a NestJS se ha completado, proporcionando una API funcional que replica la lógica del proyecto Django original. El frontend se ha planificado como una SPA separada que consumiría esta nueva API.

Consulte [upl-nestjs-api/README.md](./upl-nestjs-api/README.md) para obtener todos los detalles técnicos del nuevo sistema.

---

Este README.md raíz sirve como una guía general del repositorio.
Para trabajar con la nueva API, diríjase al directorio `upl-nestjs-api/` y siga las instrucciones de su README.

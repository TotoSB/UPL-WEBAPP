# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el resto del código fuente de la aplicación
COPY . .

# Compilar la aplicación TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine

# Establecer un usuario no root para mayor seguridad
USER node

WORKDIR /home/node/app

# Copiar dependencias de producción desde la etapa de builder
# Esto es más eficiente si se usa npm ci --only=production en la etapa de builder
# pero para simplificar, copiaremos todo node_modules por ahora.
# En una optimización, se podrían instalar solo las dependencias de producción.
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/package*.json ./

# Copiar la aplicación compilada desde la etapa de builder
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

# Exponer el puerto en el que la aplicación NestJS se ejecutará (por defecto 3000)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main.js"]

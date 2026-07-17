# Stage 1: Build
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache)
COPY package.json bun.lock ./

# Instalar dependências
RUN bun install --frozen-lockfile

# Copiar código-fonte
COPY . .

# Build args para variáveis de ambiente em tempo de build
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_WS_URL=ws://localhost:5000/ws

# Build da aplicação
RUN bun run build

# Stage 2: Servir com Nginx
FROM nginx:alpine

# Copiar config customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos estáticos do build
COPY --from=build /app/dist /usr/share/nginx/html

# Porta do Nginx
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

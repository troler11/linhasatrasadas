# Estágio 1: Build (Compilação do TypeScript/React)
FROM node:20-slim AS build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build do projeto (gera a pasta dist ou build)
RUN npm run build

# Estágio 2: Serve (Servidor Nginx para rodar o site)
FROM nginx:alpine

# Copia o build do estágio anterior para a pasta do Nginx
# Se o seu projeto usa Vite, a pasta é 'dist'. Se usa Create React App, é 'build'.
COPY --from=build /app/dist /usr/share/nginx/html

# Copia uma configuração customizada do Nginx (opcional, mas recomendado)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

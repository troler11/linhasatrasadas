FROM node:20 AS build

WORKDIR /app

# O ponto (.) indica o diretório atual do seu repositório/Easypanel
# Certifique-se de que o package.json está no mesmo nível que o Dockerfile
COPY package.json package-lock.json* ./

# Adicionamos um comando para listar os arquivos e conferir se ele "chegou" lá (ajuda no debug)
RUN ls -la

RUN npm install

COPY . .

RUN npm run build

# --- Estágio do Nginx ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

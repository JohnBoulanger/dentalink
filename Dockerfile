FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# copy everything
COPY . .

# install backend deps
WORKDIR /app/backend
RUN npm install

# install frontend deps and build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# generate prisma client at build time
WORKDIR /app/backend
RUN npx prisma generate

# db push + seed + start at runtime (so the db persists in the running container)
EXPOSE ${PORT:-3000}
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node src/server.js ${PORT:-3000}"]

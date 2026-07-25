FROM node:18-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install --production

COPY . .

CMD ["npm", "start"]

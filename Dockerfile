FROM node:21-alpine
WORKDIR /usr/app
COPY prisma ./
COPY package.json .
COPY .env .
RUN npm install --quiet
COPY . .
EXPOSE 8080
CMD [ "npm", "start"]
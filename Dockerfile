FROM node:21-alpine
WORKDIR /usr/app
COPY prisma ./
COPY package.json .
RUN npm install --quiet
COPY . .
EXPOSE 8080
CMD [ "npm", "start"]
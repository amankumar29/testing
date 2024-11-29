FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

#RUN npm run build

RUN npm install -g serve

EXPOSE 4002

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["serve", "-s", "build"]

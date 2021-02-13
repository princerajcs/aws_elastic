FROM node:12
WORKDIR /app
COPY package.json .
COPY .sample.env .env
RUN npm install -g npm@7.5.4
RUN npm install --legacy-peer-deps
COPY . .
RUN ["npm","run", "build"]

FROM nginx
EXPOSE 80
COPY --from=0 /app/build /usr/share/nginx/html
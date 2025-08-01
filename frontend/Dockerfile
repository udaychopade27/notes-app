FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 👇 Accept build argument
ARG REACT_APP_API_URL
# 👇 Define it as an environment variable for build tools like React
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN echo "Building with API: $REACT_APP_API_URL"
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

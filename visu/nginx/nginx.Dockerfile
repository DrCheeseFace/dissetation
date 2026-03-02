FROM nginx:latest
COPY ./nginx-routing.conf /etc/nginx/conf.d/default.conf
EXPOSE 80


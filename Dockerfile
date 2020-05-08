FROM php:apache

WORKDIR /var/www/html

COPY . .

RUN docker-php-ext-install mysqli pdo pdo_mysql

ENV VIRTUAL_HOST=cookiejar.jacobrswanson.com,www.cookiejar.jacobrswanson.com
ENV VIRTUAL_PORT=80
ENV LETSENCRYPT_HOST=cookiejar.jacobrswanson.com
ENV LETSENCRYPT_EMAIL=jrs40492@gmail.com

EXPOSE 80
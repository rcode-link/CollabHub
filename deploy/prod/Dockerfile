FROM alpine

WORKDIR /app
RUN apk add --no-cache php82
RUN apk add --no-cache php82-cli
RUN apk add --no-cache php82-dev
RUN apk add --no-cache php82-pgsql
RUN apk add --no-cache php82-sqlite3
RUN apk add --no-cache php82-gd
RUN apk --no-cache add php82-pecl-imagick
RUN apk add --no-cache php82-curl
RUN apk add --no-cache php82-imap
RUN apk add --no-cache php82-pdo_mysql
RUN apk add --no-cache php82-mbstring
RUN apk add --no-cache php82-xml
RUN apk add --no-cache php82-zip
RUN apk add --no-cache php82-bcmath
RUN apk add --no-cache php82-soap
RUN apk add --no-cache php82-intl
RUN #apk add --no-cache php82-readline
RUN apk add --no-cache php82-ldap
RUN #apk add --no-cache php82-msgpack
RUN #apk add --no-cache php82-igbinary
RUN apk add --no-cache php82-redis
RUN apk add --no-cache php82-phar
RUN apk add --no-cache php82-openssl
RUN apk add --no-cache php82-iconv
RUN apk add --no-cache php82-fileinfo
RUN apk add --no-cache php82-tokenizer
RUN apk add --no-cache php82-exif
RUN apk add --no-cache php82-dom
RUN apk add --no-cache php82-xmlwriter
RUN apk add --no-cache php82-pdo
RUN apk add --no-cache php82-pdo_pgsql
RUN apk add --no-cache php82-simplexml
RUN apk add --no-cache php82-xmlreader
RUN apk add --no-cache nodejs npm
RUN apk add php82-sodium
RUN #apk add --no-cache php82-swoole
RUN #apk add --no-cache php82-memcached
RUN #apk add --no-cache php82-pcov

RUN rm  /usr/bin/php
RUN ln -s /usr/bin/php82 /usr/bin/php

#
#RUN apk add --no-cache curl
RUN apk add --no-cache --update supervisor && rm  -rf /tmp/* /var/cache/apk/*
COPY deploy/composer-setup.php .
RUN php composer-setup.php
#
COPY deploy/prod/supervisor/* /etc/supervisor/conf.d/
#
RUN mv composer.phar /usr/local/bin/composer
COPY . .
RUN rm storage/logs/laravel.log
RUN composer install
# RUN rm -rf public/build
# RUN npm ci && npm run build
ADD deploy/prod/supervisord.conf /etc/
RUN mkdir -p /var/log/supervisor
EXPOSE 80

COPY deploy/prod/start-container.sh start-container.sh
RUN chmod +x start-container.sh

ENTRYPOINT ["./start-container.sh"]

FROM alpine

WORKDIR /app
RUN apk add php82
RUN apk add php82-cli
RUN apk add php82-dev
RUN apk add php82-pgsql
RUN apk add php82-sqlite3
RUN apk add php82-gd
RUN apk --no-cache add php82-pecl-imagick
RUN apk add php82-curl
RUN apk add php82-imap
RUN #apk add php82-mysql
RUN apk add php82-mbstring
RUN apk add php82-xml
RUN apk add php82-zip
RUN apk add php82-bcmath
RUN apk add php82-soap
RUN apk add php82-intl
RUN #apk add php82-readline
RUN apk add php82-ldap
RUN #apk add php82-msgpack
RUN #apk add php82-igbinary
RUN apk add php82-redis
RUN apk add php82-phar
RUN apk add php82-openssl
RUN apk add php82-iconv
RUN apk add php82-fileinfo
RUN apk add php82-tokenizer
RUN apk add php82-exif
RUN apk add php82-dom
RUN apk add php82-xmlwriter
RUN apk add php82-pdo
RUN apk add php82-pdo_pgsql
RUN apk add php82-sodium
RUN #apk add php82-swoole
RUN #apk add php82-memcached
RUN #apk add php82-pcov

RUN ln -s /usr/bin/php82 /usr/bin/php

RUN apk add curl

COPY deploy/composer-setup.php .
RUN php composer-setup.php


RUN mv composer.phar /usr/local/bin/composer

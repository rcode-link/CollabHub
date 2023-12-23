#!/usr/bin/env sh
echo 'APP_KEY=' > .env
php artisan migrate --force
php artisan key:generate
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan storage:link

supervisord --nodaemon --configuration /etc/supervisord.conf

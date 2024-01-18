#!/usr/bin/env sh
# php artisan migrate --force
# php artisan key:generate
# php artisan config:cache
# php artisan event:cache
# php artisan route:cache
# php artisan storage:link

supervisord --nodaemon --configuration /etc/supervisord.conf

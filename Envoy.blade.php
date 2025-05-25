@servers(['web' => ['user@your-server-ip'], 'soketi' => 'root@soketi'])

@task('install_dependencies', ['on' => 'web', 'php_version' => '8.3', 'node_version' => '--lts'])
    # Update package list
    sudo apt-get update

    # Add repository for PHP versions
    sudo apt-get install -y software-properties-common
    sudo add-apt-repository -y ppa:ondrej/php
    sudo apt-get update

    # Install specified PHP version and required extensions
    sudo apt-get install -y php{{$php_version}}-imagick php{{$php_version}} php{{$php_version}}-cli php{{$php_version}}-fpm php{{$php_version}}-mysql php{{$php_version}}-zip php{{$php_version}}-gd php{{$php_version}}-mbstring php{{$php_version}}-curl php{{$php_version}}-xml php{{$php_version}}-bcmath

    # Install Composer
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php
    php -r "unlink('composer-setup.php');"
    sudo mv composer.phar /usr/local/bin/composer

    # Install NVM and Node.js
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

    # Load NVM and install specified Node.js version
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install {{$node_version}}
    nvm use {{$node_version}}
@endtask
@task("deploy", ['on' => 'web'])
    # Install Laravel dependencies
    cd /var/www/html
    git pull
    composer install
    npm install
    npm run dev
    php artisan migrate --force
@endtask

@task("setupsoketi", ['on' => 'soketi'])

@endtask





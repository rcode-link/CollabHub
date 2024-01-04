export const initAxios = () => {
    const instance = axios.create({
        timeout: 1000,
        headers: {
            Accept: 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },

    });
    instance.interceptors.request.use(function (config) {
        if (import.meta.env.DEV) {
            config.url += config.url.indexOf('?') > -1 ? '&XDEBUG_SESSION_START=PHPSTORM' : '?XDEBUG_SESSION_START=PHPSTORM'
        }
        return config;
    }, function (error) {
        // Do something with request error
        return error;
    });
    instance.interceptors.response.use(function (response) {
        console.log({res: response})
        return response;
    }, function (error) {
        if (error.response.status === 401 && location.pathname !== '/login') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return error;
    });
    window.axios = instance;
}

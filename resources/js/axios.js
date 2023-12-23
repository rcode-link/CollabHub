export const initAxios = () => {
    window.axios = axios.create({
        timeout: 1000,
        headers: {
            Accept: 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },

    });
}

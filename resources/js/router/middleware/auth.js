
export default function ({ next, router }) {
    if(!localStorage.getItem('token')) {
        router.push({ name: 'login' });
    }

    return next();
}

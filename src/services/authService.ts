import api from './api';
import Cookies from 'js-cookie';

export const AuthService = {

    async login(email: string, password: string) {
        const response = await api.post('/user/login', { email, password });
        if (response.data.token) {
            Cookies.set('authToken', response.data.token, {
                expires: 7,
                secure: import.meta.env.PROD,
                sameSite: 'strict'
            });
        }
        return response.data;
    },

    async register(email: string, password: string) {
        return api.post('/user/register', { email, password });
    },

    logout() {
        Cookies.remove('authToken');
        window.location.href = '/login';
    },

    getCurrentUser() {
        const token = Cookies.get('authToken');
        return token ? { token } : null;
    },

    async getWhitelist() {
        const response = await api.get('/whitelist');
        return response.data;
    },

    async getPendingWhitelist() {
        const response = await api.get('/whitelist/pending');
        return response.data;
    },

    async addToWhitelist(email: string) {
        return api.post('/whitelist', { email });
    },

    async removeFromWhitelist(email: string) {
        return api.delete(`/whitelist/${encodeURIComponent(email)}`);
    },

    async removeUser(email: string) {
        return api.delete(`/user/delete`, { data: { email } });
    }
};
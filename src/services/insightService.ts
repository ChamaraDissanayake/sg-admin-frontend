import api from './api';
import { Insight } from '../types/Insight';

const insightService = {
    async fetchInsights(params?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = params || {};
        console.log('Chamara', page, limit);

        const response = await api.get('/insights', {
            params: {
                page,
                limit
            }
        });
        console.log('Chamara response', response);

        return {
            data: response.data.insights as Insight[],
            total: response.data.pagination.total
        };
    },

    async fetchInsightById(id: string) {
        const response = await api.get(`/insights/${id}`);
        return response.data;
    },

    async createInsight(data: Insight) {
        try {
            const response = await api.post('/insights', data);
            return response.data;
        } catch (error) {
            console.error('Error creating insight:', error);
            throw new Error('Failed to create insight');
        }
    },

    async updateInsight(id: string, data: {
        category?: string;
        video?: {
            title?: string;
            thumbnail?: string;
            url?: string;
        };
        article?: {
            title?: string;
            description?: string;
            thumbnail?: string;
            content?: string;
            time?: number;
        };
    }) {
        return api.put(`/insights/${id}`, data);
    },

    async deleteInsight(id: string) {
        return api.delete(`/insights/${id}`);
    }
};

export default insightService;
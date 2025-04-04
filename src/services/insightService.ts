import axios, { AxiosRequestConfig } from 'axios';
import api from './api';
import { Insight } from '../types/Insight';

const insightService = {
    async fetchInsights(params?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = params || {};
        const response = await api.get('/insights', {
            params: {
                page,
                limit
            }
        });
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
            throw new Error(
                'Failed to create insight'
            );
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
    },

    async uploadFile(file: File, config?: AxiosRequestConfig<FormData>) {
        try {
            // Client-side size validation
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('File exceeds 50MB limit');
            }

            const formData = new FormData();
            formData.append('file', file);

            // Merge custom config with default config
            const mergedConfig: AxiosRequestConfig<FormData> = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000, // 5 minute timeout for large files
                ...config // Spread the custom config last to allow overrides
            };

            const response = await api.post('/files/upload', formData, mergedConfig);

            // Handle duplicate response
            if (response.data.isDuplicate) {
                console.log('Using existing file:', response.data.fileId);
            }

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 413) {
                    throw new Error('File too large (max 50MB)');
                }
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Unknown upload error occurred');
        }
    },

    /**
     * Fetch all uploaded files
     */
    async fetchFiles() {
        return api.get('/files');
    },

    /**
     * Delete a file by ID
     */
    async deleteFile(id: number): Promise<void> {
        await api.delete(`/files/${id}`);
    },
};

export default insightService;
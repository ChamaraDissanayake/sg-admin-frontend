import axios from 'axios';
import api from './api';

const insightService = {
    async fetchInsights() {
        const response = await api.get('/insights');
        return response.data;
    },

    async fetchInsightById(id: string) {
        const response = await api.get(`/insights/${id}`);
        return response.data;
    },

    async createInsight(data: {
        category: string;
        video?: {
            title?: string;
            thumbnail?: string;
            url?: string;
        };
        article?: {
            title?: string;
            description?: string;
            thumbnail?: string;
            content?: string;  // Now explicitly string
            time?: number;
        };
    }) {
        try {
            // No content transformation needed - send as-is
            console.log();

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

    /**
     * Upload a file (video or thumbnail)
     */
    // insightService.ts
    async uploadFile(file: File) {
        try {
            // Client-side size validation (optional but good UX)
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('File exceeds 50MB limit');
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000 // 5 minute timeout for large files
            });

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
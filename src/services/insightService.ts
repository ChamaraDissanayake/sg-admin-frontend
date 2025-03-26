import api from './api';

const insightService = {
    /**
     * Fetch all insights
     */
    async fetchInsights() {
        return api.get('/insights');
    },

    /**
     * Fetch a single insight by ID
     */
    async fetchInsightById(id: number) {
        return api.get(`/insights/${id}`);
    },

    async addToWhitelist(email: string) {
        return api.post('/whitelist', { email });
    },

    /**
     * Create a new insight
     */
    async createInsight(data: {
        type: string,
        category: string,
        title: string,
        description?: string,
        time?: string,
        video_url?: string,
        thumbnail_url?: string,
        content?: string
    }) {
        // Removed the nested {data} object - sending data directly
        return api.post('/insights', data);
    },

    /**
     * Update an existing insight
     */
    async updateInsight(id: number, data: {
        type?: string,
        category?: string,
        title?: string,
        description?: string,
        time?: string,
        video_url?: string,
        thumbnail_url?: string,
        content?: string
    }) {
        return api.put(`/insights/${id}`, data);
    },

    /**
     * Delete an insight
     */
    async deleteInsight(id: number): Promise<void> {
        await api.delete(`/insights/${id}`);
    },

    /**
     * Upload a file (video or thumbnail)
     */
    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
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
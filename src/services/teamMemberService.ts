import api from './api';
import { ApiTeamMember, TeamMember } from '../types/TeamMember';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default {
    async getAllTeamMembers(): Promise<ApiTeamMember[]> {
        const response = await api.get(`${API_URL}/team`);
        return response.data;
    },

    async createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
        console.log('Chamara member', member);

        const response = await api.post(`${API_URL}/team`, member);
        return response.data;
    },

    async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember> {
        const response = await api.put(`${API_URL}/team/${id}`, member);
        return response.data;
    },

    async deleteTeamMember(id: number): Promise<void> {
        await api.delete(`${API_URL}/team/${id}`);
    },
};
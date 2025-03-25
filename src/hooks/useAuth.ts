import { useAuth } from '../context/AuthContext';

export const useAuthUser = () => {
    return useAuth();
};
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';

interface AuthContextType {
    user: { token: string } | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<{ token: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const user = AuthService.getCurrentUser();
            setUser(user);
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const user = await AuthService.login(email, password);
        setUser(user);
    };

    const register = async (email: string, password: string) => {
        await AuthService.register(email, password);
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    const value = { user, loading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
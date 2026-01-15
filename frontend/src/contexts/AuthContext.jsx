import { createContext, useContext, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider(props) {
    const [user, setUser] = createSignal(null);
    const [loading, setLoading] = createSignal(true);
    const navigate = useNavigate();

    createEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.getCurrentUser()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    });

    const login = async (username, password) => {
        await api.login(username, password);
        const userData = await api.getCurrentUser();
        setUser(userData);
        navigate('/');
    };

    const register = async (username, email, password) => {
        await api.register(username, email, password);
        await login(username, password);
    };

    const logout = () => {
        api.clearToken();
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: () => !!user()
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

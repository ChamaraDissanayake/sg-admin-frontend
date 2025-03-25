import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface ErrorResponse {
    response?: {
        data?: {
            error?: string;
        };
    };
    message?: string;
}

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            const errorObj = err as ErrorResponse;
            setError(errorObj?.response?.data?.error || 'Invalid email or password');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
                <div className="p-2 text-red-600 bg-red-100 rounded-md">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="email" className="block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    <Link
                        to="/forgot-password"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Forgot password?
                    </Link>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Sign in
                </button>
            </div>

            <div className="text-sm text-center text-black">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Register here
                </Link>
            </div>
        </form>
    );
};

export default LoginForm;
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Connect to backend
        setMessage('If an account exists, you will receive a password reset link');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className="p-2 text-blue-600 bg-blue-50 rounded-md">
                    {message}
                </div>
            )}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Send reset link
                </button>
            </div>

            <div className="text-sm text-center">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                </Link>
            </div>
        </form>
    );
};

export default ForgotPasswordForm;
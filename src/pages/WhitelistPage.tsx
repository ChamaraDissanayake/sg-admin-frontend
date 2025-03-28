import { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

const WhitelistPage = () => {
    const [emails, setEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchWhitelist();
    }, []);

    const fetchWhitelist = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await AuthService.getWhitelist();
            setEmails(data);
        } catch (err) {
            setError('Failed to load whitelist');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = async () => {
        if (!newEmail.trim()) return;

        setError('');
        setSuccess('');

        try {
            await AuthService.addToWhitelist(newEmail.trim());
            setNewEmail('');
            setSuccess(`${newEmail} added to whitelist`);
            fetchWhitelist();
        } catch (err) {
            console.log(err);

            setError('Failed to add email');
        }
    };

    const handleRemoveEmail = async (email: string) => {
        if (!window.confirm(`Remove ${email} from whitelist?`)) return;

        setError('');
        setSuccess('');

        try {
            await AuthService.removeFromWhitelist(email);
            setSuccess(`${email} removed from whitelist`);
            fetchWhitelist();
        } catch (err) {
            console.log(err);
            setError('Failed to remove email');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Whitelist Management</h1>

            {/* Status Messages */}
            {success && (
                <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-md">
                    {success}
                </div>
            )}
            {error && (
                <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            {/* Add Email Form */}
            <div className="mb-8">
                <div className="flex items-center gap-2">
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter email to whitelist"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                    />
                    <button
                        onClick={handleAddEmail}
                        disabled={!newEmail.trim()}
                        className="px-4 py-2 text-white bg-blue-800 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Add Email
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    Only whitelisted emails can login to admin dashboard
                </p>
            </div>

            {/* Email List */}
            <div>
                <h2 className="mb-4 text-lg font-semibold">
                    Whitelisted Emails ({loading ? '...' : emails.length})
                </h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                        No whitelisted emails found
                    </div>
                ) : (
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emails.map((email) => (
                                    <tr key={email}>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-900 whitespace-nowrap">
                                            {email}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhitelistPage;
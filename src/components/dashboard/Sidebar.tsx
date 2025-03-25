import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Insights', path: '/insights' },
        { name: 'Whitelist Emails', path: '/whitelist' },
        { name: 'Profile', path: '/profile' },
    ];

    return (
        <div className="w-64 bg-white shadow-md">
            <div className="p-4 h-full flex flex-col">
                <h2 className="text-xl font-bold mb-8 text-gray-800">Admin Dashboard</h2>

                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`block px-4 py-2 rounded-md ${location.pathname === item.path
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    onClick={logout}
                    className="mt-auto px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-md"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
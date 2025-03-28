import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/logo.png';

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Insights', path: '/insights' },
        { name: 'Whitelist Emails', path: '/whitelist' },
        { name: 'Profile', path: '/profile' },
    ];

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-[#051737] shadow-md flex flex-col p-4">
            <img src={Logo} className="mb-6" alt="Logo" />
            <nav className="flex-1">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`block px-4 py-2 rounded-md ${location.pathname === item.path
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-300 hover:bg-gray-100 hover:text-gray-900'
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
                className="px-4 py-2 mt-auto text-left text-gray-300 rounded-md hover:bg-red-500 hover:text-white"
            >
                Logout
            </button>
        </div>
    );
};

export default Sidebar;

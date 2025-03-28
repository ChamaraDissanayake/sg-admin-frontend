import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64 flex-1 p-8 overflow-auto h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;

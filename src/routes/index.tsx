import { createBrowserRouter } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import PrivateRoutes from './PrivateRoutes';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import InsightsPage from '../pages/InsightsPage';
import WhitelistPage from '../pages/WhitelistPage';
import ProfilePage from '../pages/ProfilePage';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <PrivateRoutes />,
            children: [
                {
                    element: <DashboardLayout />,
                    children: [
                        { index: true, element: <DashboardPage /> },
                        { path: 'insights', element: <InsightsPage /> },
                        { path: 'whitelist', element: <WhitelistPage /> },
                        { path: 'profile', element: <ProfilePage /> },
                    ],
                },
            ],
        },
        {
            path: '/login',
            element: <PublicRoutes />,
            children: [{ index: true, element: <LoginPage /> }],
        },
        {
            path: '/register',
            element: <PublicRoutes />,
            children: [{ index: true, element: <RegisterPage /> }],
        },
        {
            path: '/forgot-password',
            element: <PublicRoutes />,
            children: [{ index: true, element: <ForgotPasswordPage /> }],
        },
    ],
    {
        basename: '/admin', // Set the base path for routing
    }
);

export default router;
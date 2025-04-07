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
import TeamMembersPage from '../pages/TeamMembersPage';

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
                        { path: 'team', element: <TeamMembersPage /> },
                        { path: 'whitelist', element: <WhitelistPage /> },
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
);

export default router;
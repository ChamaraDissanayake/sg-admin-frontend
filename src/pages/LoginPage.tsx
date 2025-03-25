import LoginForm from '../components/auth/LoginForm';
import AuthLayout from '../components/auth/AuthLayout';

const LoginPage = () => {
    return (
        <AuthLayout title="Sign in to your account">
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginPage;
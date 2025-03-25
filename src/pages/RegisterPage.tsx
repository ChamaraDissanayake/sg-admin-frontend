import RegisterForm from '../components/auth/RegisterForm';
import AuthLayout from '../components/auth/AuthLayout';

const RegisterPage = () => {
    return (
        <AuthLayout title="Create a new account">
            <RegisterForm />
        </AuthLayout>
    );
};

export default RegisterPage;
import AuthLayout from '../components/auth/AuthLayout';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout title="Reset your password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
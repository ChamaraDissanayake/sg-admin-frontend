import { ReactNode } from 'react';

const AuthLayout = ({
    children,
    title
}: {
    children: ReactNode;
    title: string;
}) => (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-200 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                {title}
            </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
                {children}
            </div>
        </div>
    </div>
);

export default AuthLayout;
import { ReactNode } from "react";

type ModalProps = {
    children: ReactNode;
    onClose: () => void;
};

const PreviewModal = ({ children, onClose }: ModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative animate-float">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 text-gray-500 transition-colors duration-200 hover:text-red-500"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
};

export default PreviewModal;
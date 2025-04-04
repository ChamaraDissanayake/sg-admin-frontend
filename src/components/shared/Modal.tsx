import { useEffect } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.body.style.overflow = "auto";
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {/* Modal Container */}
            <div className="relative w-[96%] max-w-5xl max-h-[90vh] bg-white shadow-xl overflow-y-auto">

                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    className="fixed z-50 text-gray-200 shadow-lg top-2 right-4 hover:text-red-500"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal Body */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal;

import { useState } from "react";
import teamMemberService from "../../services/teamMemberService";
import axios from "axios";
import PreviewModal from "../shared/PreviewModal";
import { TeamMember } from "../../types/TeamMember";

type TeamMemberFormProps = {
    member?: TeamMember | null;
    mode?: 'add' | 'edit' | 'view';
    onSuccess?: () => void;
    onCancel?: () => void;
};

const TeamMemberForm = ({ member = null, mode = 'add', onSuccess, onCancel }: TeamMemberFormProps) => {
    const [name, setName] = useState(member?.name || "");
    const [position, setPosition] = useState(member?.position || "");
    const [bio, setBio] = useState(member?.bio || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(member?.imagePath || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const getMediaUrl = (url: string) => {
        if (!url) return "";
        return url.startsWith("uploads/")
            ? `${import.meta.env.VITE_BASE_URL}/${url}`
            : url;
    };

    const handlePreview = () => {
        if (imagePreview) {
            setPreviewImage(getMediaUrl(imagePreview));
        }
    };

    const closePreview = () => {
        setPreviewImage(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setError("");

        if (!name) {
            return setError("Name is required");
        }

        if (!position) {
            return setError("Position is required");
        }

        setIsSubmitting(true);

        try {
            let imagePath = member?.imagePath || "";

            if (imageFile) {
                const imageRes = await teamMemberService.uploadImage(imageFile);
                imagePath = imageRes.path;
            }

            const memberData: TeamMember = {
                name,
                position,
                bio,
                imagePath
            };

            if (mode === 'add') {
                await teamMemberService.createTeamMember(memberData);
            } else if (mode === 'edit' && member?.id) {
                await teamMemberService.updateTeamMember(member.id, memberData);
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Team member operation error:", err);
            let message = mode === 'add' ? "Failed to create team member" : "Failed to update team member";
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.error || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl p-6 mx-auto bg-white shadow">
            {previewImage && (
                <PreviewModal onClose={closePreview}>
                    <div className="p-8 bg-gray-300 rounded-lg w-[90vw] max-h-[90vh]">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] mx-auto"
                        />
                    </div>
                </PreviewModal>
            )}

            <h1 className="mb-6 text-2xl font-bold text-gray-800">
                {mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'} Team Member
            </h1>

            {error && (
                <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-md">
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Name*</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter team member name"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Position*</label>
                            <input
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter team member position"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={4}
                                placeholder="Enter team member bio"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Profile Image</label>
                            {mode !== 'view' && (
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    accept="image/*"
                                />
                            )}

                            {(imagePreview || member?.imagePath) && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Current image:</p>
                                    <div
                                        className="cursor-pointer"
                                        onClick={handlePreview}
                                    >
                                        <div className="relative self-center max-w-xs mx-auto">
                                            <img
                                                src={imagePreview || getMediaUrl(member?.imagePath || "")}
                                                alt="Current profile"
                                                className="object-cover w-32 h-32 mt-2 border border-gray-200 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                )}
                {mode !== 'view' && (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-6 py-3 text-white rounded-md ${isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? (
                            mode === 'add' ? 'Creating...' : 'Updating...'
                        ) : (
                            mode === 'add' ? 'Submit' : 'Update'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TeamMemberForm;
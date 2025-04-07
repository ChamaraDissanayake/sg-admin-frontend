import { useState, useEffect } from "react";
import teamMemberService from "../../services/teamMemberService";
import fileService from "../../services/fileService";
import axios from "axios";
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
    const [imagePreview, setImagePreview] = useState<string | null>(null); // Image preview state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Set image preview from the existing member (if in edit or view mode)
    useEffect(() => {
        if (mode !== 'add' && member?.imagePath) {
            setImagePreview(member.imagePath);
        }
    }, [mode, member?.imagePath]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create a temporary URL for the preview image
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
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
                const imageRes = await fileService.uploadFile(imageFile);
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

                        {mode !== 'view' && (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Profile Image</label>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    accept="image/*"
                                />

                                {/* Image preview */}
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img
                                            src={imagePreview}
                                            alt="Image preview"
                                            className="object-cover w-32 h-32 rounded-md"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* In View mode, show the current image if available */}
                        {mode === 'view' && imagePreview && (
                            <div className="mt-4">
                                <img
                                    src={imagePreview}
                                    alt="Current profile image"
                                    className="object-cover w-32 h-32 rounded-md"
                                />
                            </div>
                        )}
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

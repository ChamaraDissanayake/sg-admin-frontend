import { useState, useEffect } from "react";
import TeamMemberForm from "../components/team/TeamMemberForm";
import teamMemberService from "../services/teamMemberService";
import Modal from "../components/shared/Modal";
import { ApiTeamMember, TeamMember } from "../types/TeamMember";

const TeamMembersPage = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
    const [action, setAction] = useState<"add" | "edit" | "view">("add");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);

            // Fetch API response which is ApiTeamMember[]
            const rawMembers: ApiTeamMember[] = await teamMemberService.getAllTeamMembers();

            // Map it to TeamMember[] for the frontend
            const members: TeamMember[] = rawMembers.map(member => {
                const isRelative = member.image_path?.startsWith('uploads');

                return {
                    id: member.id,  // Keep id as a number
                    name: member.name,
                    position: member.position,
                    bio: member.bio,
                    imagePath: isRelative
                        ? `${import.meta.env.VITE_BASE_URL}/${member.image_path}`
                        : member.image_path // If it's a full URL, keep it as is
                };
            });

            setTeamMembers(members); // Now set correctly typed `TeamMember[]`
        } catch (err) {
            setError("Failed to fetch team members");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const handleAddClick = () => {
        setCurrentMember({
            name: '',
            position: '',
            imagePath: '',
            bio: ''
        });
        setAction("add");
        setShowForm(true);
    };

    const handleEditClick = (member: TeamMember) => {
        setCurrentMember(member);
        setAction("edit");
        setShowForm(true);
    };

    const handleViewClick = (member: TeamMember) => {
        setCurrentMember(member);
        setAction("view");
        setShowForm(true);
    };

    const handleDeleteClick = (id?: number) => {
        if (!id) {
            setError("Cannot delete team member without ID");
            return;
        }
        setMemberToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!memberToDelete) return;

        try {
            await teamMemberService.deleteTeamMember(memberToDelete);
            setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete));
            setShowDeleteConfirm(false);
        } catch (err) {
            console.log(err);
            setError("Failed to delete team member");
        }
    };

    const handleFormSubmitSuccess = () => {
        setShowForm(false);
        fetchTeamMembers();
    };

    const closeModal = () => {
        setShowForm(false);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="container p-4 mx-auto">
            <h1 className="mb-6 text-2xl font-bold">Manage Team Members</h1>

            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                    {error}
                    <button
                        onClick={() => setError("")}
                        className="float-right font-bold"
                    >
                        &times;
                    </button>
                </div>
            )}

            <div className="flex justify-between mb-4">
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 text-white bg-blue-800 rounded hover:bg-blue-700"
                >
                    Add New Team Member
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-300">
                                <th className="px-4 py-2 border">#</th>
                                <th className="px-4 py-2 border">Image</th>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Position</th>
                                <th className="px-4 py-2 border !w-[206px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-gray-500">
                                        No team members found
                                    </td>
                                </tr>
                            ) : (
                                teamMembers.map((member, index) => (
                                    <tr key={member.id || index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{index + 1}</td>
                                        <td className="px-4 py-2 border">
                                            {member.imagePath && (
                                                <img
                                                    src={member.imagePath}
                                                    alt={member.name}
                                                    className="object-cover w-12 h-12 rounded-full"
                                                />

                                            )}
                                        </td>
                                        <td className="px-4 py-2 border">{member.name}</td>
                                        <td className="px-4 py-2 border">{member.position}</td>
                                        <td className="px-4 py-2 space-x-2 border !w-[206px]">
                                            <button
                                                onClick={() => handleViewClick(member)}
                                                className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(member)}
                                                className="px-2 py-1 text-green-600 hover:text-green-800 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(member.id)}
                                                className="px-2 py-1 text-red-600 hover:text-red-800 hover:underline"
                                                disabled={!member.id}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showForm} onClose={closeModal} title={`${action === 'add' ? 'Add' : action === 'edit' ? 'Edit' : 'View'} Team Member`}>
                <TeamMemberForm
                    member={currentMember}
                    mode={action}
                    onSuccess={handleFormSubmitSuccess}
                    onCancel={closeModal}
                />
            </Modal>

            <Modal isOpen={showDeleteConfirm} onClose={closeModal} title="Confirm Delete">
                <div className="p-4">
                    <p className="mb-4">Are you sure you want to delete this team member? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeamMembersPage;
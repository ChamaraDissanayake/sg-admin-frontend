import { useState, useEffect } from "react";
import AddInsight from "../components/insights/AddInsight";
import insightService from "../services/insightService";
import Modal from "../components/shared/Modal";

type Insight = {
    id: string;
    category: string;
    video?: {
        title: string;
        thumbnail: string;
        url: string;
    };
    article?: {
        title: string;
        description: string;
        thumbnail: string;
        content: string;
        time: number;
    };
    createdAt: string;
};

const InsightsPage = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);
    const [action, setAction] = useState<"add" | "edit" | "view">("add");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [insightToDelete, setInsightToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const data = await insightService.fetchInsights();
                setInsights(data);
            } catch (err) {
                setError("Failed to fetch insights");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    const handleAddClick = () => {
        setCurrentInsight(null);
        setAction("add");
        setShowForm(true);
    };

    const handleEditClick = (insight: Insight) => {
        setCurrentInsight(insight);
        setAction("edit");
        setShowForm(true);
    };

    const handleViewClick = (insight: Insight) => {
        setCurrentInsight(insight);
        setAction("view");
        setShowForm(true);
    };

    const handleDeleteClick = (id: string) => {
        setInsightToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!insightToDelete) return;

        try {
            await insightService.deleteInsight(insightToDelete);
            setInsights(insights.filter(insight => insight.id !== insightToDelete));
            setShowDeleteConfirm(false);
        } catch (err) {
            setError("Failed to delete insight");
            console.error(err);
        }
    };

    const handleFormSubmitSuccess = () => {
        setShowForm(false);
        const fetchInsights = async () => {
            try {
                const data = await insightService.fetchInsights();
                setInsights(data);
            } catch (err) {
                setError("Failed to refresh insights");
                console.error(err);
            }
        };
        fetchInsights();
    };

    const closeModal = () => {
        setShowForm(false);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="container p-4 mx-auto">
            <h1 className="mb-6 text-2xl font-bold">Manage Insights</h1>

            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 text-white bg-blue-800 rounded hover:bg-blue-700"
                >
                    Add New Insight
                </button>
            </div>

            {loading ? (
                <div>Loading insights...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 border">Category</th>
                                <th className="px-4 py-2 border">Type</th>
                                <th className="px-4 py-2 border">Title</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insights.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-gray-500">
                                        No insights found
                                    </td>
                                </tr>
                            ) : (
                                insights.map((insight) => (
                                    <tr key={insight.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{insight.category}</td>
                                        <td className="px-4 py-2 border">
                                            {insight.video?.thumbnail && insight.article?.thumbnail ? (
                                                'Full'
                                            ) : insight.video?.thumbnail ? (
                                                'Video Only'
                                            ) : insight.article?.thumbnail ? (
                                                'Article Only'
                                            ) : (
                                                'Unknown'
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {insight.video?.title || insight.article?.title}
                                        </td>
                                        <td className="px-4 py-2 space-x-2 border">
                                            <button
                                                onClick={() => handleViewClick(insight)}
                                                className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(insight)}
                                                className="px-2 py-1 text-green-600 hover:text-green-800 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(insight.id)}
                                                className="px-2 py-1 text-red-600 hover:text-red-800 hover:underline"
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

            <Modal isOpen={showForm} onClose={closeModal} title={`${action === 'add' ? 'Add' : action === 'edit' ? 'Edit' : 'View'} Insight`}>
                <AddInsight
                    insight={currentInsight}
                    mode={action}
                    onSuccess={handleFormSubmitSuccess}
                    onCancel={closeModal}
                />
            </Modal>

            <Modal isOpen={showDeleteConfirm} onClose={closeModal} title="Confirm Delete">
                <div className="p-4">
                    <p className="mb-4">Are you sure you want to delete this insight? This action cannot be undone.</p>
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

export default InsightsPage;
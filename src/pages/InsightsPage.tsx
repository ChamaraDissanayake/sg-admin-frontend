import { useState, useEffect, useCallback } from "react";
import InsightForm from "../components/insights/InsightForm";
import insightService from "../services/insightService";
import Modal from "../components/shared/Modal";
import { Insight } from "../types/Insight";

const PAGE_SIZE = 10;

const InsightsPage = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);
    const [action, setAction] = useState<"add" | "edit" | "view">("add");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [insightToDelete, setInsightToDelete] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);

    const refreshInsights = useCallback(async (resetPage = true, customPage = 1) => {
        try {
            if (resetPage) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await insightService.fetchInsights({
                page: customPage,
                limit: PAGE_SIZE
            });

            if (resetPage) {
                setInsights(response.data);
                setPage(1);
            } else {
                setInsights(prev => [...prev, ...response.data]);
                setPage(customPage);
            }

            setTotalRecords(response.total);
            setHasMore(response.data.length === PAGE_SIZE &&
                response.data.length < response.total);
        } catch (err) {
            setError("Failed to fetch insights");
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        refreshInsights(true, 1);
    }, [refreshInsights]);

    const loadMoreInsights = async () => {
        if (!hasMore || loadingMore) return;

        const nextPage = page + 1;
        await refreshInsights(false, nextPage);
    };


    const handleAddClick = () => {
        setCurrentInsight({
            category: '',
            video: undefined,
            article: undefined
        });
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

    const handleDeleteClick = (id?: string) => {
        if (!id) {
            setError("Cannot delete insight without ID");
            return;
        }
        setInsightToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!insightToDelete) return;

        try {
            // Optimistic update
            setInsights(prev => prev.filter(i => i.id !== insightToDelete));
            setTotalRecords(prev => prev - 1);
            setShowDeleteConfirm(false);

            // Server sync
            await insightService.deleteInsight(insightToDelete);

            // Final consistency check
            await refreshInsights(true);
        } catch (err) {
            // Rollback on error
            console.log(err);

            refreshInsights(true);
            setError("Failed to delete insight");
        }
    };

    const handleFormSubmitSuccess = () => {
        setShowForm(false);
        refreshInsights(true);
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
                    Add New Insight
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
                                <th className="px-4 py-2 border">Category</th>
                                <th className="px-4 py-2 border">Type</th>
                                <th className="px-4 py-2 border">Title</th>
                                <th className="px-4 py-2 border !w-[206px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insights?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-gray-500">
                                        No insights found
                                    </td>
                                </tr>
                            ) : (
                                insights.map((insight, index) => (
                                    <tr key={insight.id || Math.random()} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{index + 1}</td>
                                        <td className="px-4 py-2 border">{insight.category}</td>
                                        <td className="px-4 py-2 border">
                                            {insight.video?.url && insight.article?.title ? (
                                                'Full'
                                            ) : insight.video?.url ? (
                                                'Video Only'
                                            ) : insight.article?.title ? (
                                                'Article Only'
                                            ) : (
                                                'Unknown'
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {insight.video?.title || insight.article?.title || 'Untitled'}
                                        </td>
                                        <td className="px-4 py-2 space-x-2 border !w-[206px]">
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
                                                disabled={!insight.id}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {insights.length} out of {totalRecords} insights
                        </div>
                        {hasMore && (
                            <button
                                onClick={loadMoreInsights}
                                disabled={loadingMore}
                                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </span>
                                ) : 'Load More'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <Modal isOpen={showForm} onClose={closeModal} title={`${action === 'add' ? 'Add' : action === 'edit' ? 'Edit' : 'View'} Insight`}>
                <InsightForm
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
import { useState, useRef } from "react";
import insightService from "../../services/insightService";
import axios from "axios";

type Insight = {
    id?: string;
    category?: string;
    video?: {
        title?: string;
        thumbnail?: string;
        url?: string;
    };
    article?: {
        title?: string;
        description?: string;
        thumbnail?: string;
        content?: string;
        time?: number;
    };
};

type AddInsightProps = {
    insight?: Insight | null;
    mode?: 'add' | 'edit' | 'view';
    onSuccess?: () => void;
    onCancel?: () => void;
};

const AddInsight = ({ insight = null, mode = 'add', onSuccess, onCancel }: AddInsightProps) => {
    // Form state
    const [category, setCategory] = useState(insight?.category || "Technology");
    const [videoTitle, setVideoTitle] = useState(insight?.video?.title || "");
    const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [articleTitle, setArticleTitle] = useState(insight?.article?.title || "");
    const [articleDescription, setArticleDescription] = useState(insight?.article?.description || "");
    const [articleTime, setArticleTime] = useState(insight?.article?.time?.toString() || "");
    const [articleThumbnail, setArticleThumbnail] = useState<File | null>(null);
    const [articleContent, setArticleContent] = useState(insight?.article?.content || "<p></p>");

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

    const insertHtmlTag = (startTag: string, endTag: string = "") => {
        if (!htmlTextareaRef.current) return;

        const textarea = htmlTextareaRef.current;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = textarea.value.substring(startPos, endPos);

        const newValue =
            textarea.value.substring(0, startPos) +
            startTag + selectedText + endTag +
            textarea.value.substring(endPos);

        setArticleContent(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = startPos + startTag.length;
            textarea.selectionEnd = endPos + startTag.length;
        }, 0);
    };

    const handleSubmit = async () => {
        setError("");

        if (!videoTitle && !articleTitle) {
            return setError("At least one title (video or article) is required.");
        }

        if (videoTitle && (!videoThumbnail || !videoFile) && mode === 'add') {
            return setError("Video requires both thumbnail and video file");
        }

        if (articleTitle && (!articleThumbnail || !articleTime) && mode === 'add') {
            return setError("Article requires thumbnail and reading time");
        }

        setIsSubmitting(true);
        setIsUploading(true);

        try {
            let videoThumbnailUrl = insight?.video?.thumbnail || "";
            let videoUrl = insight?.video?.url || "";
            let articleThumbnailUrl = insight?.article?.thumbnail || "";

            if (videoThumbnail) {
                const thumbnailRes = await insightService.uploadFile(videoThumbnail);
                videoThumbnailUrl = thumbnailRes.path;
            }

            if (videoFile) {
                const videoRes = await insightService.uploadFile(videoFile);
                videoUrl = videoRes.path;
            }

            if (articleThumbnail) {
                const thumbnailRes = await insightService.uploadFile(articleThumbnail);
                articleThumbnailUrl = thumbnailRes.path;
            }

            const insightData = {
                category,
                ...(videoTitle && {
                    video: {
                        title: videoTitle,
                        thumbnail: videoThumbnailUrl,
                        url: videoUrl
                    }
                }),
                ...(articleTitle && {
                    article: {
                        title: articleTitle,
                        description: articleDescription,
                        thumbnail: articleThumbnailUrl,
                        content: articleContent,
                        time: parseInt(articleTime) || 10
                    }
                })
            };

            if (mode === 'add') {
                await insightService.createInsight(insightData);
            } else if (mode === 'edit' && insight?.id) {
                await insightService.updateInsight(insight.id, insightData);
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Insight operation error:", err);
            let message = mode === 'add' ? "Failed to create insight" : "Failed to update insight";
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.error || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
                {mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'} Insight
            </h1>

            {error && (
                <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={mode === 'view'}
                >
                    <option value="AI">AI</option>
                    <option value="Technology">Technology</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Cloud">Cloud</option>
                </select>
            </div>

            <div className="space-y-8">
                {/* Video Section */}
                <div className="p-4 border border-gray-200 rounded-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700">Video Section</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Video Title</label>
                            <input
                                type="text"
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter video title"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Video Thumbnail</label>
                            <input
                                type="file"
                                onChange={(e) => setVideoThumbnail(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                                disabled={mode === 'view'}
                            />
                            {insight?.video?.thumbnail && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Current thumbnail:</p>
                                    <img src={`${import.meta.env.VITE_API_BASE_URL}/${insight.video.thumbnail}`} alt="Current thumbnail" className="h-20 mt-1" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Video File</label>
                            <input
                                type="file"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="video/*"
                                disabled={mode === 'view'}
                            />
                            {insight?.video?.url && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Current video:</p>
                                    <video src={`${import.meta.env.VITE_API_BASE_URL}/${insight.video.url}`} controls className="h-20 mt-1" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Article Section */}
                <div className="p-4 border border-gray-200 rounded-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700">Article Section</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Article Title</label>
                            <input
                                type="text"
                                value={articleTitle}
                                onChange={(e) => setArticleTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter article title"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Article Description</label>
                            <textarea
                                value={articleDescription}
                                onChange={(e) => setArticleDescription(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Enter article description"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Reading Time (minutes)</label>
                            <input
                                type="number"
                                value={articleTime}
                                onChange={(e) => setArticleTime(e.target.value)}
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Estimated reading time"
                                disabled={mode === 'view'}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Article Thumbnail</label>
                            <input
                                type="file"
                                onChange={(e) => setArticleThumbnail(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                                disabled={mode === 'view'}
                            />
                            {insight?.article?.thumbnail && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Current thumbnail:</p>
                                    <img src={`${import.meta.env.VITE_API_BASE_URL}/${insight.article.thumbnail}`} alt="Current thumbnail" className="h-20 mt-1" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Article Content</label>
                            <div className="space-y-2">
                                {mode !== 'view' && (
                                    <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded">
                                        <button
                                            onClick={() => insertHtmlTag('<p>', '</p>')}
                                            className="px-2 py-1 text-xs bg-white border rounded"
                                        >
                                            Paragraph
                                        </button>
                                        <button
                                            onClick={() => insertHtmlTag('<h2>', '</h2>')}
                                            className="px-2 py-1 text-xs bg-white border rounded"
                                        >
                                            Heading
                                        </button>
                                        <button
                                            onClick={() => insertHtmlTag('<strong>', '</strong>')}
                                            className="px-2 py-1 text-xs bg-white border rounded"
                                        >
                                            Bold
                                        </button>
                                        <button
                                            onClick={() => insertHtmlTag('<em>', '</em>')}
                                            className="px-2 py-1 text-xs bg-white border rounded"
                                        >
                                            Italic
                                        </button>
                                        <button
                                            onClick={() => insertHtmlTag('<ul><li>', '</li></ul>')}
                                            className="px-2 py-1 text-xs bg-white border rounded"
                                        >
                                            List
                                        </button>
                                        <button
                                            onClick={() => insertHtmlTag('<a href="" target="_blank">', '</a>')}
                                            className="px-2 py-1 text-xs bg-white border rounded"
                                        >
                                            Link
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    ref={htmlTextareaRef}
                                    value={articleContent}
                                    onChange={(e) => setArticleContent(e.target.value)}
                                    className="w-full h-40 p-2 font-mono text-sm border border-gray-300 rounded-md"
                                    placeholder="Enter HTML content"
                                    disabled={mode === 'view'}
                                />
                                <div className="p-2 text-xs text-gray-500 rounded bg-gray-50">
                                    <p>Preview:</p>
                                    <div
                                        className="p-2 mt-1 border border-gray-200 rounded"
                                        dangerouslySetInnerHTML={{ __html: articleContent }}
                                    />
                                </div>
                            </div>
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
                        disabled={isSubmitting || isUploading}
                        className={`px-6 py-3 text-white rounded-md ${isSubmitting || isUploading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isUploading ? 'Uploading files...' :
                            isSubmitting ? (mode === 'add' ? 'Creating insight...' : 'Updating insight...') :
                                (mode === 'add' ? 'Submit Insight' : 'Update Insight')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AddInsight;
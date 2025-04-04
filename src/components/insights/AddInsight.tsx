import { useState, useRef, useEffect } from "react";
import insightService from "../../services/insightService";
import axios, { AxiosProgressEvent } from "axios";
import { Insight } from "../../types/Insight";
import PreviewModal from "../shared/PreviewModal";

type AddInsightProps = {
    insight?: Insight | null;
    mode?: 'add' | 'edit' | 'view';
    onSuccess?: () => void;
    onCancel?: () => void;
};

const AddInsight = ({ insight = null, mode = 'add', onSuccess, onCancel }: AddInsightProps) => {
    // Form state
    const [category, setCategory] = useState(insight?.category || "AI");
    const [videoTitle, setVideoTitle] = useState(insight?.video?.title || "");
    const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState(insight?.video?.isExternal ? insight.video.url : "");
    const [isExternalVideo, setIsExternalVideo] = useState(insight?.video?.isExternal || false);
    const [articleTitle, setArticleTitle] = useState(insight?.article?.title || "");
    const [articleDescription, setArticleDescription] = useState(insight?.article?.description || "");
    const [articleTime, setArticleTime] = useState(insight?.article?.time?.toString() || "");
    const [articleThumbnail, setArticleThumbnail] = useState<File | null>(null);
    const [articleContent, setArticleContent] = useState(insight?.article?.content || "<p></p>");
    const [youtubeThumbnailUrl, setYoutubeThumbnailUrl] = useState("");

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const [previewItem, setPreviewItem] = useState<{
        type: 'image' | 'video' | 'youtube';
        url: string;
    } | null>(null);
    const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Extract YouTube video ID and set thumbnail URL
    useEffect(() => {
        if (isExternalVideo && videoUrl) {
            const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
            const match = videoUrl.match(youtubeRegex);

            if (match && match[1]) {
                const videoId = match[1];
                setYoutubeThumbnailUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
            } else {
                setYoutubeThumbnailUrl("");
            }
        } else {
            setYoutubeThumbnailUrl("");
        }
    }, [videoUrl, isExternalVideo]);

    const handlePreview = (type: 'image' | 'video' | 'youtube', url: string) => {
        setPreviewItem({ type, url });
    };

    const closePreview = () => {
        setPreviewItem(null);
    };

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
        setUploadProgress(0);

        if (!videoTitle && !articleTitle) {
            return setError("At least one title (video or article) is required.");
        }

        if (videoTitle) {
            if (isExternalVideo) {
                if (!videoUrl) {
                    return setError("Please provide a video URL");
                }
                // Basic URL validation
                try {
                    new URL(videoUrl);
                } catch {
                    return setError("Please provide a valid video URL");
                }
            } else {
                if ((!videoThumbnail || !videoFile) && mode === 'add') {
                    return setError("Video requires both thumbnail and video file when uploading");
                }
            }
        }

        setIsSubmitting(true);
        setIsUploading(true);

        try {
            let videoThumbnailUrl = insight?.video?.thumbnail || "";
            let finalVideoUrl = "";

            // Configure axios to track upload progress

            const config = {
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            };

            if (isExternalVideo) {
                finalVideoUrl = videoUrl!;

                if (youtubeThumbnailUrl) {
                    videoThumbnailUrl = youtubeThumbnailUrl;
                } else if (insight?.video?.thumbnail) {
                    videoThumbnailUrl = insight.video.thumbnail;
                }
            } else {
                // Handle file uploads with progress tracking
                if (videoThumbnail) {
                    const thumbnailRes = await insightService.uploadFile(videoThumbnail, config);
                    videoThumbnailUrl = thumbnailRes.path;
                }

                if (videoFile) {
                    const videoRes = await insightService.uploadFile(videoFile, config);
                    finalVideoUrl = videoRes.path;
                } else if (insight?.video?.url && !insight.video.isExternal) {
                    finalVideoUrl = insight.video.url;
                }
            }

            let articleThumbnailUrl = insight?.article?.thumbnail || "";

            if (articleThumbnail) {
                const thumbnailRes = await insightService.uploadFile(articleThumbnail, config);
                articleThumbnailUrl = thumbnailRes.path;
            }

            const insightData: Insight = {
                category,
                ...(videoTitle && {
                    video: {
                        title: videoTitle,
                        thumbnail: videoThumbnailUrl,
                        url: finalVideoUrl,
                        isExternal: isExternalVideo
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
            setUploadProgress(0);
        }
    };

    const getMediaUrl = (url: string) => {
        return url.startsWith("uploads/")
            ? `${import.meta.env.VITE_BASE_URL}/${url}`
            : url;
    };

    return (
        <div className="max-w-4xl p-6 mx-auto bg-white shadow">
            {/* Preview Modal */}
            {previewItem && (
                <PreviewModal onClose={closePreview}>
                    <div className="p-8 bg-gray-300 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto">
                        {previewItem.type === 'image' && (
                            <img
                                src={previewItem.url}
                                alt="Preview"
                                className="max-w-full max-h-[80vh] mx-auto"
                            />
                        )}
                        {previewItem.type === 'video' && (
                            <video
                                src={previewItem.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[80vh] mx-auto"
                            />
                        )}
                        {previewItem.type === 'youtube' && (
                            <div className="w-full aspect-w-16 aspect-h-9">
                                <iframe
                                    src={`https://www.youtube.com/embed/${previewItem.url.split('/vi/')[1].split('/')[0]}`}
                                    className="w-full h-[80vh]"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                </PreviewModal>
            )}

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

                        {mode !== 'view' && (
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="external-video"
                                    checked={isExternalVideo}
                                    onChange={(e) => setIsExternalVideo(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="external-video" className="ml-2 text-sm font-medium text-gray-700">
                                    Use external video URL (e.g., YouTube)
                                </label>
                            </div>
                        )}

                        {isExternalVideo ? (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Video URL</label>
                                <input
                                    type="text"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter YouTube or other video URL"
                                    disabled={mode === 'view'}
                                />
                                {youtubeThumbnailUrl && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">YouTube Thumbnail Preview:</p>
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => handlePreview('image', youtubeThumbnailUrl)}
                                        >
                                            <img
                                                src={youtubeThumbnailUrl}
                                                alt="YouTube thumbnail preview"
                                                className="w-full h-auto border border-gray-200 rounded-md max-h-64"
                                                onError={(e) => {
                                                    const youtubeId = youtubeThumbnailUrl.split('/vi/')[1].split('/')[0];
                                                    e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {insight?.video?.url && insight.video.isExternal && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">Current video URL:</p>
                                        <a
                                            href={insight.video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {insight.video.url}
                                        </a>
                                        <div
                                            className="mt-2 cursor-pointer"
                                            onClick={() => handlePreview('youtube', insight.video!.url!)}
                                        >
                                            <div className="relative">
                                                {youtubeThumbnailUrl ? (
                                                    <>
                                                        <img
                                                            src={youtubeThumbnailUrl}
                                                            alt="YouTube thumbnail"
                                                            className="w-full h-auto border border-gray-200 rounded-md max-h-64"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-full">
                                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="p-4 bg-gray-100 rounded-md">
                                                        <p className="text-gray-500">Click to preview YouTube video</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Video Thumbnail</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setVideoThumbnail(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        accept="image/*"
                                        disabled={mode === 'view'}
                                    />
                                    {insight?.video?.thumbnail && !insight.video.isExternal && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500">Current thumbnail:</p>
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => handlePreview('image', getMediaUrl(insight.video!.thumbnail!))}
                                            >
                                                <img
                                                    src={getMediaUrl(insight.video.thumbnail)}
                                                    alt="Current thumbnail"
                                                    className="w-full h-auto mt-2 border border-gray-200 rounded-md max-h-64"
                                                />
                                            </div>
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
                                    {insight?.video?.url && !insight.video.isExternal && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500">Current video:</p>
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => handlePreview('video', getMediaUrl(insight.video!.url!))}
                                            >
                                                <video
                                                    src={getMediaUrl(insight.video.url)}
                                                    className="w-full h-auto mt-2 border border-gray-200 rounded-md max-h-64"
                                                />
                                                <div className="mt-1 text-sm text-center text-gray-500">Click to play video</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
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
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">Current thumbnail:</p>
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handlePreview('image', getMediaUrl(insight.article!.thumbnail!))}
                                    >
                                        <img
                                            src={getMediaUrl(insight.article.thumbnail)}
                                            alt="Current thumbnail"
                                            className="w-full h-auto mt-2 border border-gray-200 rounded-md max-h-64"
                                        />
                                    </div>
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
                    <div className="flex flex-col items-end w-full space-y-2">
                        {/* Upload progress bar */}
                        {isUploading && (
                            <div className="w-full">
                                <div className="flex justify-between mb-1 text-sm text-gray-600">
                                    <span>Uploading files...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

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
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddInsight;
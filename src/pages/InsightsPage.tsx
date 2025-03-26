import { useState, useRef } from "react";
import insightService from "../services/insightService";

const InsightsPage = () => {
    const [category, setCategory] = useState("Technology");
    const [videoTitle, setVideoTitle] = useState("");
    const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const [articleTitle, setArticleTitle] = useState("");
    const [articleDescription, setArticleDescription] = useState("");
    const [articleTime, setArticleTime] = useState("");
    const [articleThumbnail, setArticleThumbnail] = useState<File | null>(null);
    const [articleContent, setArticleContent] = useState("<p></p>");

    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (!videoTitle && !articleTitle) {
            return alert("At least one title (video or article) is required.");
        }

        setIsSubmitting(true);

        try {
            // Determine the type based on what's being submitted
            const type = videoTitle && articleTitle ? "both" : videoTitle ? "video" : "article";

            // Upload files and prepare data
            let videoThumbnailUrl = "";
            let videoUrl = "";
            let articleThumbnailUrl = "";

            if (videoThumbnail) {
                const thumbnailRes = await insightService.uploadFile(videoThumbnail);
                videoThumbnailUrl = thumbnailRes.data.path;
            }

            if (videoFile) {
                const videoRes = await insightService.uploadFile(videoFile);
                videoUrl = videoRes.data.path;
            }

            if (articleThumbnail) {
                const thumbnailRes = await insightService.uploadFile(articleThumbnail);
                articleThumbnailUrl = thumbnailRes.data.path;
            }

            // Prepare data for API - match exactly what the backend expects
            const insightData = {
                type,
                category, // Add this line
                title: videoTitle || articleTitle,
                description: articleDescription,
                time: articleTime,
                video_url: videoUrl,
                thumbnail_url: videoThumbnailUrl || articleThumbnailUrl,
                content: articleContent
            };

            console.log("Sending data to API:", insightData);
            await insightService.createInsight(insightData);
            alert("Insight added successfully!");

            // Reset form
            setCategory("Technology");
            setVideoTitle("");
            setVideoThumbnail(null);
            setVideoFile(null);
            setArticleTitle("");
            setArticleDescription("");
            setArticleTime("");
            setArticleThumbnail(null);
            setArticleContent("<p></p>");
        } catch (error) {
            console.error("Error creating insight:", error);
            alert(`Error adding insight: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Add Insight</h1>

            <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
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
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Video Thumbnail</label>
                            <input
                                type="file"
                                onChange={(e) => setVideoThumbnail(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Video File</label>
                            <input
                                type="file"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="video/*"
                            />
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
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Description</label>
                            <textarea
                                value={articleDescription}
                                onChange={(e) => setArticleDescription(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Enter article description"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Reading Time (minutes)</label>
                            <input
                                type="number"
                                value={articleTime}
                                onChange={(e) => setArticleTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Estimated reading time"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Article Thumbnail</label>
                            <input
                                type="file"
                                onChange={(e) => setArticleThumbnail(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">Content</label>
                            <div className="space-y-2">
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
                                <textarea
                                    ref={htmlTextareaRef}
                                    value={articleContent}
                                    onChange={(e) => setArticleContent(e.target.value)}
                                    className="w-full h-40 p-2 font-mono text-sm border border-gray-300 rounded-md"
                                    placeholder="Enter HTML content"
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

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 mt-6 text-white rounded-md ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Insight'}
            </button>
        </div>
    );
};

export default InsightsPage;
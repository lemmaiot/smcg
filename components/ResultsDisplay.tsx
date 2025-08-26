import React, { useState, useEffect } from 'react';
import { PostSuggestion, Platform } from '../types';

interface ResultsDisplayProps {
  suggestions: PostSuggestion[];
  onReset: () => void;
  platform: Platform;
  handle: string;
  topic: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ suggestions, onReset, platform, handle, topic }) => {
    const [editableSuggestions, setEditableSuggestions] = useState<PostSuggestion[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        setEditableSuggestions(suggestions);
    }, [suggestions]);

    const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
        const newSuggestions = [...editableSuggestions];
        newSuggestions[index] = { ...newSuggestions[index], caption: e.target.value };
        setEditableSuggestions(newSuggestions);
    };
    
    const handleCopyToClipboard = (text: string, type: 'caption' | 'hashtags', index: number) => {
        navigator.clipboard.writeText(text);
        const key = `${type}-${index}`;
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
    };


    const handleShare = async (suggestion: PostSuggestion) => {
        const { caption, hashtags } = suggestion;
        const textToShare = `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;
    
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Social post for ${platform}`,
                    text: textToShare,
                });
                return;
            } catch (error) {
                console.warn('Web Share API failed, falling back.', error);
            }
        }
    
        const encodedText = encodeURIComponent(textToShare);
    
        switch (platform) {
            case Platform.Twitter:
                window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank', 'noopener,noreferrer');
                break;
            case Platform.Facebook:
                 window.open(`https://www.facebook.com/sharer/sharer.php?u=https://example.com&quote=${encodedText}`, '_blank', 'noopener,noreferrer');
                break;
            case Platform.LinkedIn:
                handleCopyToClipboard(textToShare, 'caption', -1);
                alert("Post content copied! We'll open LinkedIn for you to create a new post.");
                window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
                break;
            default:
                handleCopyToClipboard(textToShare, 'caption', -1);
                alert(`Content for your ${platform} post has been copied! Open the app to create a new post.`);
                break;
        }
    };

    return (
        <div className="animate-fade-in-up">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Here are your content ideas!</h2>
                <p className="text-gray-600 mt-2">
                    Generated for <span className="font-semibold text-brand-primary">{handle}</span> on <span className="font-semibold text-brand-primary">{platform}</span> about "{topic}"
                </p>
            </header>

            <div className="space-y-8">
                {editableSuggestions.map((suggestion, index) => {
                    const captionKey = `caption-${index}`;
                    const hashtagsKey = `hashtags-${index}`;
                    return (
                        <div key={index} 
                             className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-lg transition-shadow hover:shadow-2xl animate-fade-in-up"
                             style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-3">Caption Option {index + 1}</h3>
                                <div className="relative bg-gray-50 p-4 rounded-md min-h-[100px] border border-gray-200">
                                    {editingIndex === index ? (
                                        <textarea
                                            value={suggestion.caption}
                                            onChange={(e) => handleCaptionChange(e, index)}
                                            onBlur={() => setEditingIndex(null)}
                                            className="w-full h-full bg-white text-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
                                            autoFocus
                                            rows={5}
                                        />
                                    ) : (
                                        <p onClick={() => setEditingIndex(index)} className="text-gray-700 whitespace-pre-wrap cursor-pointer p-2 rounded-md transition-colors">
                                            {suggestion.caption}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => handleCopyToClipboard(suggestion.caption, 'caption', index)}
                                        className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-white bg-brand-primary rounded-md hover:bg-opacity-80 transition-all"
                                    >
                                        {copiedStates[captionKey] ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Hashtags</h3>
                                <div className="relative bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <p className="text-brand-primary/90 font-medium whitespace-pre-wrap leading-relaxed">
                                        {suggestion.hashtags.map(tag => `#${tag}`).join(' ')}
                                    </p>
                                    <button
                                        onClick={() => handleCopyToClipboard(suggestion.hashtags.map(h => `#${h}`).join(' '), 'hashtags', index)}
                                        className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-white bg-brand-primary rounded-md hover:bg-opacity-80 transition-all"
                                    >
                                        {copiedStates[hashtagsKey] ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Suggestion</h3>
                                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-brand-secondary flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-600 italic">{suggestion.imageSuggestion}</p>
                                    </div>
                                </div>
                            </div>

                             <div>
                                <button onClick={() => handleShare(suggestion)} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:opacity-90 transition-opacity duration-300 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                    Share Post Idea
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-12">
                <button
                    onClick={onReset}
                    className="px-8 py-3 font-semibold text-white bg-brand-primary rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                >
                    Start a New Post
                </button>
            </div>
        </div>
    );
};

export default ResultsDisplay;
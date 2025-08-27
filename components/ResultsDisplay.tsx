import React, { useState, useEffect } from 'react';
import { PostSuggestion, Platform } from '../types';
import InstagramIcon from './icons/InstagramIcon';
import TwitterIcon from './icons/TwitterIcon';
import FacebookIcon from './icons/FacebookIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import TikTokIcon from './icons/TikTokIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';


interface ResultsDisplayProps {
  suggestions: PostSuggestion[];
  onReset: () => void;
  platform: Platform;
  handle: string;
  topic: string;
  onRegenerate: (platform: Platform) => void;
  nextSteps: string[];
  isGeneratingNextSteps: boolean;
}

const platforms = [
  { name: Platform.Instagram, icon: <InstagramIcon />, color: "text-[#E1306C]", hoverColor: "hover:border-[#E1306C]" },
  { name: Platform.Twitter, icon: <TwitterIcon />, color: "text-[#1DA1F2]", hoverColor: "hover:border-[#1DA1F2]" },
  { name: Platform.Facebook, icon: <FacebookIcon />, color: "text-[#4267B2]", hoverColor: "hover:border-[#4267B2]" },
  { name: Platform.LinkedIn, icon: <LinkedInIcon />, color: "text-[#0077B5]", hoverColor: "hover:border-[#0077B5]" },
  { name: Platform.TikTok, icon: <TikTokIcon />, color: "text-[#000000]", hoverColor: "hover:border-[#000000]" },
];

const postingTips: { [key in Platform]: string } = {
    [Platform.Instagram]: "For Reels, use trending audio and aim for quick cuts. For feed posts, a high-quality image is crucial. Post Stories for behind-the-scenes content.",
    [Platform.Twitter]: "Engage in conversations and use relevant hashtags sparingly. Posting threads can be a great way to share more detailed information.",
    [Platform.Facebook]: "Videos (especially Live) get high engagement. Encourage comments by asking questions to your audience.",
    [Platform.LinkedIn]: "Tag relevant companies or people. The best times to post are typically during business hours on weekdays.",
    [Platform.TikTok]: "Post consistently and hop on trends quickly. The first 3 seconds of your video are the most important to capture attention.",
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ suggestions, onReset, platform, handle, topic, onRegenerate, nextSteps, isGeneratingNextSteps }) => {
    const [editableSuggestions, setEditableSuggestions] = useState<PostSuggestion[]>([]);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        setEditableSuggestions(suggestions);
    }, [suggestions]);

    const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
        const newSuggestions = [...editableSuggestions];
        newSuggestions[index] = { ...newSuggestions[index], caption: e.target.value };
        setEditableSuggestions(newSuggestions);
    };
    
    const handleCopyToClipboard = (text: string, type: string, index: number) => {
        navigator.clipboard.writeText(text);
        const key = `${type}-${index}`;
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
    };


    const handleShare = async (suggestion: PostSuggestion, index: number) => {
        const { caption, hashtags } = suggestion;
        const textToShare = `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;
    
        // Use Web Share API if available
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Social post for ${platform}`,
                    text: textToShare,
                });
                return; // Share was successful
            } catch (error) {
                // If user cancels the share, it throws an AbortError. In that case, we shouldn't fall back.
                if (error instanceof DOMException && error.name === 'AbortError') {
                    console.log('Share action was cancelled by the user.');
                    return; 
                }
                console.warn('Web Share API failed, falling back to other methods.', error);
            }
        }
    
        // Fallback logic for browsers that don't support Web Share API or if it fails
        const encodedText = encodeURIComponent(textToShare);
    
        switch (platform) {
            case Platform.Twitter:
                window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank', 'noopener,noreferrer');
                break;
            case Platform.Facebook:
                 // The 'u' parameter is required for the Facebook sharer. Using the brand website as a placeholder.
                 window.open(`https://www.facebook.com/sharer/sharer.php?u=https://lemmaiot.com.ng&quote=${encodedText}`, '_blank', 'noopener,noreferrer');
                break;
            case Platform.LinkedIn:
                handleCopyToClipboard(textToShare, 'share', index);
                alert("Post content copied! We'll open LinkedIn for you to create a new post.");
                window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
                break;
            default: // For Instagram, TikTok, etc.
                handleCopyToClipboard(textToShare, 'share', index);
                alert(`Content for your ${platform} post has been copied! Open the app to create a new post.`);
                break;
        }
    };

    return (
        <div className="animate-fade-in-up">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Here are your content ideas!</h2>
                <p className="text-gray-600 mt-2">
                    Generated for <span className="font-semibold text-brand-primary">{handle}</span> on the topic of "{topic}".
                </p>
            </header>

            <div className="mb-8 p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                <p className="text-center text-sm font-semibold text-gray-700 mb-3">Want ideas for another platform?</p>
                <div className="flex justify-center items-center gap-3">
                    {platforms.map(p => (
                        <button 
                            key={p.name}
                            onClick={() => onRegenerate(p.name)}
                            disabled={p.name === platform}
                            className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${p.name === platform ? 'border-brand-primary bg-brand-primary/10' : `bg-white ${p.hoverColor} hover:-translate-y-1`} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                            aria-label={`Regenerate for ${p.name}`}
                        >
                            <div className={`w-6 h-6 ${p.color}`}>{p.icon}</div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-200 text-blue-800 p-4 rounded-lg mb-8 text-sm">
                <LightbulbIcon />
                <div>
                  <h4 className="font-bold mb-1">{platform} Best Practices</h4>
                  <p>{postingTips[platform]}</p>
                </div>
            </div>


            <div className="space-y-8">
                {editableSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white/60 p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="mb-4">
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-2">Image Suggestion</h3>
                            <p className="text-gray-800 italic">"{suggestion.imageSuggestion}"</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-2">Caption</h3>
                            <textarea
                                value={suggestion.caption}
                                onChange={(e) => handleCaptionChange(e, index)}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-y"
                                rows={5}
                                aria-label={`Caption for suggestion ${index + 1}`}
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-2">Hashtags</h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestion.hashtags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-full">#{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center justify-end border-t pt-4 border-gray-200">
                             <button
                                onClick={() => handleCopyToClipboard(suggestion.caption, 'caption', index)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                {copiedStates[`caption-${index}`] ? 'Copied!' : 'Copy Caption'}
                            </button>
                             <button
                                onClick={() => handleCopyToClipboard(suggestion.hashtags.map(h => `#${h}`).join(' '), 'hashtags', index)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                {copiedStates[`hashtags-${index}`] ? 'Copied!' : 'Copy Hashtags'}
                            </button>
                            <button
                                onClick={() => handleShare(suggestion, index)}
                                className="px-5 py-2 text-sm font-semibold text-white bg-brand-secondary rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUpIcon />
                    <h3 className="text-2xl font-bold text-gray-900">What to Post Next?</h3>
                </div>
                 {isGeneratingNextSteps ? (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Generating follow-up ideas...</p>
                    </div>
                ) : nextSteps.length > 0 ? (
                    <ul className="space-y-3 list-disc list-inside bg-white/60 p-6 rounded-xl shadow-lg border border-gray-200 text-gray-700">
                        {nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Could not generate follow-up ideas at this time.</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-12">
                <button
                    onClick={onReset}
                    className="px-8 py-3 font-semibold text-white bg-brand-primary rounded-lg hover:bg-opacity-90 transition-colors duration-300 transform hover:scale-105"
                >
                    Start Over
                </button>
            </div>
        </div>
    );
};

export default ResultsDisplay;
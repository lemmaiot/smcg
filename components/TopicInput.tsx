import React, { useState } from 'react';
import { Platform } from '../types';

interface TopicInputProps {
  platform: Platform;
  handle: string;
  onSubmit: (topic: string) => void;
  onBack: () => void;
  error: string | null;
}

const TopicInput: React.FC<TopicInputProps> = ({ platform, handle, onSubmit, onBack, error }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Step 3: Define Your Topic</h2>
      <p className="text-center text-gray-600 mb-8">What would you like the new post for <span className="font-bold text-brand-primary">{handle}</span> to be about?</p>
      
      <div className="bg-gray-50/50 p-3 rounded-md mb-6 text-sm text-center border border-gray-200">
        <p className="text-gray-600">Generating content for <span className="font-semibold text-gray-800">{platform}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The launch of our new productivity app"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none"
          rows={4}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!topic.trim()}
              className="px-6 py-3 font-semibold text-white bg-brand-primary rounded-lg hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Generate Content
            </button>
        </div>
      </form>
    </div>
  );
};

export default TopicInput;
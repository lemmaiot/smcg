import React, { useState, useCallback } from 'react';
import { AppStep, Platform, PostSuggestion } from './types';
import PlatformSelector from './components/PlatformSelector';
import HandleInput from './components/HandleInput';
import HandleConfirmation from './components/HandleConfirmation';
import TopicInput from './components/TopicInput';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDisplay from './components/ResultsDisplay';
import { generateSocialMediaContent, generateNextPostIdeas } from './services/geminiService';
import SparklesIcon from './components/icons/SparklesIcon';
import BrandLogo from './components/BrandLogo';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_PLATFORM);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [handle, setHandle] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [suggestions, setSuggestions] = useState<PostSuggestion[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingNextSteps, setIsGeneratingNextSteps] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlatformSelect = (selectedPlatform: Platform) => {
    setPlatform(selectedPlatform);
    setStep(AppStep.ENTER_HANDLE);
  };

  const handleHandleSubmit = (userHandle: string) => {
    setHandle(userHandle);
    setStep(AppStep.CONFIRM_HANDLE);
  };

  const handleHandleConfirm = () => {
    setStep(AppStep.ENTER_TOPIC);
  };

  const handleHandleEdit = () => {
    setStep(AppStep.ENTER_HANDLE);
  };

  const handleGenerateContent = useCallback(async (postTopic: string) => {
    if (!platform || !handle) return;
    setTopic(postTopic);
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setNextSteps([]);
    setStep(AppStep.GENERATING);

    try {
      const results = await generateSocialMediaContent(platform, handle, postTopic);
      setSuggestions(results);
      setStep(AppStep.SHOW_RESULTS);
      setIsLoading(false); // Main content is loaded

      // Fetch next steps in the background
      setIsGeneratingNextSteps(true);
      try {
        const nextStepIdeas = await generateNextPostIdeas(platform, handle, postTopic);
        setNextSteps(nextStepIdeas);
      } catch (nextStepError) {
        console.error("Could not generate next step ideas:", nextStepError);
        setNextSteps([]); // Fail gracefully
      } finally {
        setIsGeneratingNextSteps(false);
      }

    } catch (err) {
      console.error(err);
      setError('Sorry, something went wrong while generating content. Please try again.');
      setStep(AppStep.ENTER_TOPIC); // Revert to topic input on error
      setIsLoading(false);
    }
  }, [platform, handle]);

  const handleRegenerateForPlatform = useCallback(async (newPlatform: Platform) => {
    if (!handle || !topic) return;

    setPlatform(newPlatform);
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setNextSteps([]);
    setStep(AppStep.GENERATING);

    try {
        const results = await generateSocialMediaContent(newPlatform, handle, topic);
        setSuggestions(results);
        setStep(AppStep.SHOW_RESULTS);
        setIsLoading(false); // Main content is loaded

        // Fetch next steps in the background
        setIsGeneratingNextSteps(true);
        try {
            const nextStepIdeas = await generateNextPostIdeas(newPlatform, handle, topic);
            setNextSteps(nextStepIdeas);
        } catch (nextStepError) {
            console.error("Could not generate next step ideas:", nextStepError);
            setNextSteps([]);
        } finally {
            setIsGeneratingNextSteps(false);
        }
    } catch (err) {
        console.error(err);
        setError('Sorry, something went wrong while generating content. Please try again.');
        setStep(AppStep.ENTER_TOPIC);
        setIsLoading(false);
    }
  }, [handle, topic]);

  const handleReset = () => {
    setStep(AppStep.SELECT_PLATFORM);
    setPlatform(null);
    setHandle('');
    setTopic('');
    setSuggestions([]);
    setNextSteps([]);
    setError(null);
  };
  
  const renderStep = () => {
    switch (step) {
      case AppStep.SELECT_PLATFORM:
        return <PlatformSelector onSelect={handlePlatformSelect} />;
      case AppStep.ENTER_HANDLE:
        return <HandleInput platform={platform!} onSubmit={handleHandleSubmit} onBack={() => setStep(AppStep.SELECT_PLATFORM)} />;
      case AppStep.CONFIRM_HANDLE:
        return <HandleConfirmation platform={platform!} handle={handle} onConfirm={handleHandleConfirm} onEdit={handleHandleEdit} />;
      case AppStep.ENTER_TOPIC:
        return <TopicInput platform={platform!} handle={handle} onSubmit={handleGenerateContent} onBack={handleHandleEdit} error={error} />;
      case AppStep.GENERATING:
        return <LoadingSpinner />;
      case AppStep.SHOW_RESULTS:
        return <ResultsDisplay 
                  suggestions={suggestions} 
                  onReset={handleReset} 
                  platform={platform!} 
                  handle={handle} 
                  topic={topic} 
                  onRegenerate={handleRegenerateForPlatform}
                  nextSteps={nextSteps}
                  isGeneratingNextSteps={isGeneratingNextSteps}
               />;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-10">
            <BrandLogo />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
              <SparklesIcon />
              AI Content Generator
            </h1>
            <p className="text-lg text-gray-600">Craft the perfect social media post in seconds.</p>
        </header>
        <main className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-200">
            {renderStep()}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Product of <a href="https://lemmaiot.com.ng" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">LemmaIoT</a></p>
        </footer>
       </div>
    </div>
  );
};

export default App;
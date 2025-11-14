
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EmailEditor, EmailEditorHandles } from './components/EmailEditor';
import { GeneratedEmail } from './components/GeneratedEmail';
import { Header } from './components/Header';
import { VoiceComposer } from './components/VoiceComposer';
import type { GeneratedEmailContent, EmailRequestData, EmailStyle } from './types';
import { generateEmail } from './services/geminiService';
import { Icon } from './components/Icon';
import { AuthPage } from './components/auth/AuthPage';
import { HistoryPanel } from './components/HistoryPanel';

type AppMode = 'text' | 'voice';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>('text');
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmailContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<EmailRequestData | null>(null);
  const [history, setHistory] = useState<GeneratedEmailContent[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const emailEditorRef = useRef<EmailEditorHandles>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('emailHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('emailHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    // Reset app state on sign out
    setGeneratedEmail(null);
    setError(null);
    setLastRequest(null);
    setMode('text');
    setHistory([]);
    setIsHistoryPanelOpen(false);
  };

  const handleGenerateEmail = useCallback(async (formData: EmailRequestData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedEmail(null);
    setLastRequest(formData); // Save the last request
    try {
      const result = await generateEmail(formData);
      setGeneratedEmail(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate email. Please check your prompt and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleRegenerateWithStyle = useCallback(async (newStyle: EmailStyle) => {
      if (!lastRequest) return;
      // Use the last prompt and search setting, but with the new style
      await handleGenerateEmail({ ...lastRequest, style: newStyle });
    }, [lastRequest, handleGenerateEmail]);

  const handleEmailGeneratedFromVoice = useCallback((content: GeneratedEmailContent) => {
    setGeneratedEmail(content);
    setMode('text'); // Switch back to text view to see the result
  }, []);


  const handleNewEmail = useCallback(() => {
    setGeneratedEmail(null);
    setError(null);
    setLastRequest(null);
    emailEditorRef.current?.reset();
  }, []);

  const handleSaveToHistory = (email: GeneratedEmailContent) => {
    const newHistoryEntry = {
      ...email,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
    };
    setHistory(prev => [newHistoryEntry, ...prev]);
  };

  const handleLoadFromHistory = (email: GeneratedEmailContent) => {
    setGeneratedEmail(email);
    setIsHistoryPanelOpen(false);
  };
  
  const handleDeleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };


  const getModeButtonClass = (buttonMode: AppMode) => {
    const baseClasses = "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800";
    if (mode === buttonMode) {
      return `${baseClasses} bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm`;
    }
    return `${baseClasses} text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100`;
  }
  
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <Header 
        isAuthenticated={isAuthenticated} 
        onSignOut={handleSignOut}
        onToggleHistory={() => setIsHistoryPanelOpen(prev => !prev)}
      />
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        onLoad={handleLoadFromHistory}
        onDelete={handleDeleteFromHistory}
      />

      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
        <div className="flex flex-col gap-8">
          
          <div className="flex justify-center mb-4">
            <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-full flex items-center space-x-1">
              <button onClick={() => setMode('text')} className={getModeButtonClass('text')}>
                <span className="flex items-center gap-2">
                  <Icon name="sparkles" className="h-4 w-4" /> Text
                </span>
              </button>
              <button onClick={() => setMode('voice')} className={getModeButtonClass('voice')}>
                 <span className="flex items-center gap-2">
                   <Icon name="microphone" className="h-4 w-4" /> Voice
                 </span>
              </button>
            </div>
          </div>
          
          {mode === 'text' ? (
            <>
              <EmailEditor ref={emailEditorRef} onGenerate={handleGenerateEmail} isLoading={isLoading} />
              <GeneratedEmail
                content={generatedEmail}
                isLoading={isLoading}
                error={error}
                onNewEmail={handleNewEmail}
                onRegenerate={handleRegenerateWithStyle}
                onSave={handleSaveToHistory}
                currentStyle={lastRequest?.style}
              />
            </>
          ) : (
            <VoiceComposer onEmailGenerated={handleEmailGeneratedFromVoice} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;

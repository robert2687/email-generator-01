
import React, { useState, useEffect } from 'react';
import type { EmailScanResult, GeneratedEmailContent } from '../types';
import { Icon } from './Icon';

interface ScanResultProps {
  results: EmailScanResult[] | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
  onEditReply: (reply: GeneratedEmailContent) => void;
}

export const ScanResult: React.FC<ScanResultProps> = ({ results, isLoading, error, onReset, onEditReply }) => {
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  
  const currentResult = results ? results[selectedVariation] : null;
  const analysisData = results ? results[0] : null; // Summary, intent, confidence is the same for all variations

  useEffect(() => {
    if (results) {
      setSelectedVariation(0);
    }
  }, [results]);

  const handleCopy = () => {
    if (!currentResult) return;
    const { subject, body } = currentResult.suggestedReply;
    const fullEmailText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmailText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const handleSendWithGmail = () => {
    if (!currentResult) return;
    const { subject, body } = currentResult.suggestedReply;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const getTabClass = (index: number) => {
    const baseClasses = "px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none rounded-t-lg";
    if (index === selectedVariation) {
        return `${baseClasses} bg-white dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-700 border-t border-x`;
    }
    return `${baseClasses} text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50`;
  };

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (results && currentResult && analysisData) {
      return (
        <div className="flex flex-col h-full animate-fade-in">
          {/* Analysis Section */}
          <div className="mb-4 space-y-3">
            <h3 className="text-lg font-semibold">Scan Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Summary</p>
                <p className="text-sm font-medium mt-1 truncate" title={analysisData.summary}>{analysisData.summary}</p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Intent</p>
                <p className="text-sm font-medium mt-1">{analysisData.intent}</p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Confidence</p>
                <p className="text-sm font-medium mt-1">{(analysisData.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Suggested Reply</h3>
          
          {/* Tabs */}
          {results.length > 1 && (
             <div className="flex border-b border-slate-200 dark:border-slate-700 -mx-6 px-4">
               {results.map((_, index) => (
                   <button key={index} onClick={() => setSelectedVariation(index)} className={getTabClass(index)}>
                       Variation {index + 1}
                   </button>
               ))}
            </div>
          )}

          {/* Reply Content */}
          <div className="space-y-4 text-left flex-grow pt-6 flex flex-col">
            <div className="flex-grow space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject</h4>
                <p className="w-full p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  {currentResult.suggestedReply.subject}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Body</h4>
                <div className="w-full p-3 h-48 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {currentResult.suggestedReply.body}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={onReset} className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                <Icon name="refresh" className="h-5 w-5" />
                Scan New
              </button>
              <button onClick={() => onEditReply(currentResult.suggestedReply)} className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                <Icon name="edit" className="h-5 w-5" />
                Edit Reply
              </button>
              <button onClick={handleCopy} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                 {hasCopied ? <Icon name="check" className="h-5 w-5" /> : <Icon name="copy" className="h-5 w-5" />}
                 {hasCopied ? 'Copied!' : 'Copy Reply'}
              </button>
              <button onClick={handleSendWithGmail} className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                <Icon name="gmail" className="h-5 w-5" />
                Open in Gmail
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <InitialState />;
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] flex flex-col justify-center">
      {renderContent()}
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="text-center text-slate-500 dark:text-slate-400 space-y-4">
    <Icon name="loader" className="mx-auto h-12 w-12 animate-spin text-blue-600" />
    <p className="font-semibold text-lg">Analyzing Email...</p>
    <p>The AI is reading the email and drafting a smart reply.</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="text-center text-slate-400 dark:text-slate-500 space-y-4">
    <Icon name="scan" className="mx-auto h-16 w-16" />
    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">Scan Results Will Appear Here</h3>
    <p>Paste an email in the form above to analyze it and generate a reply.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-red-500 space-y-4 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
    <Icon name="error" className="mx-auto h-12 w-12" />
    <h3 className="text-xl font-semibold">An Error Occurred</h3>
    <p>{message}</p>
  </div>
);

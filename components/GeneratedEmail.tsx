import React, { useState } from 'react';
import type { GeneratedEmailContent, EmailStyle } from '../types';
import { Icon } from './Icon';
import { STYLE_OPTIONS } from '../constants';

interface GeneratedEmailProps {
  content: GeneratedEmailContent | null;
  isLoading: boolean;
  error: string | null;
  onNewEmail: () => void;
  onRegenerate: (newStyle: EmailStyle) => void;
  currentStyle?: EmailStyle;
}

export const GeneratedEmail: React.FC<GeneratedEmailProps> = ({ content, isLoading, error, onNewEmail, onRegenerate, currentStyle }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    const fullEmailText = `Subject: ${content.subject}\n\n${content.body}`;
    navigator.clipboard.writeText(fullEmailText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    if (error) {
      return <ErrorState message={error} />;
    }
    if (content) {
      return (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Email Content */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject</h3>
            <p className="w-full p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
              {content.subject}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Body</h3>
            <div 
              className="w-full p-3 h-64 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg leading-relaxed whitespace-pre-wrap"
            >
              {content.body}
            </div>
          </div>
          
          {/* Sources */}
           {content.sources && content.sources.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Sources</h3>
              <ul className="space-y-2 text-sm">
                {content.sources.map((source, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon name="external-link" className="h-4 w-4 mt-1 text-slate-400 flex-shrink-0" />
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                      title={source.title}
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Regeneration Options */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">Regenerate with a different style:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => onRegenerate(s.name)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${
                    currentStyle === s.name
                      ? 'bg-blue-600 border-blue-600 text-white cursor-default'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 disabled:opacity-50'
                  }`}
                >
                  <Icon name={s.icon} className="h-4 w-4" />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
             <button
                onClick={onNewEmail}
                className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 transition-colors"
                >
                <Icon name="edit-plus" className="h-5 w-5" />
                New Email
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {hasCopied ? (
                <>
                  <Icon name="check" className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Icon name="copy" className="h-5 w-5" />
                  Copy Email
                </>
              )}
            </button>
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
    <p className="font-semibold text-lg">Generating Your Email...</p>
    <p>The AI is crafting the perfect message.</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="text-center text-slate-400 dark:text-slate-500 space-y-4">
    <Icon name="mail-document" className="mx-auto h-16 w-16" />
    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">Your Generated Email Will Appear Here</h3>
    <p>Describe the email you need and choose a style to get started.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-red-500 space-y-4 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
    <Icon name="error" className="mx-auto h-12 w-12" />
    <h3 className="text-xl font-semibold">An Error Occurred</h3>
    <p>{message}</p>
  </div>
);
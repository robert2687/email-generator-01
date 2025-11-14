
import React, { useState, useEffect } from 'react';
import type { GeneratedEmailContent, EmailStyle } from '../types';
import { Icon } from './Icon';
import { STYLE_OPTIONS } from '../constants';

interface GeneratedEmailProps {
  contents: GeneratedEmailContent[] | null;
  isLoading: boolean;
  error: string | null;
  onNewEmail: () => void;
  onRegenerate: (newStyle: EmailStyle) => void;
  onSave: (content: GeneratedEmailContent) => void;
  currentStyle?: EmailStyle;
}

export const GeneratedEmail: React.FC<GeneratedEmailProps> = ({ contents, isLoading, error, onNewEmail, onRegenerate, onSave, currentStyle }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [hasSaved, setHasSaved] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(0);

  const currentContent = contents ? contents[selectedVariation] : null;

  useEffect(() => {
    if (contents) {
      setSelectedVariation(0);
      setHasSaved(false);
    }
  }, [contents]);

  useEffect(() => {
    if (currentContent) {
      setEditedSubject(currentContent.subject);
      setEditedBody(currentContent.body);
      setIsEditing(false); // Reset to view mode when new content or variation is selected
    }
  }, [currentContent]);

  const handleCopy = () => {
    if (!currentContent) return;
    const fullEmailText = `Subject: ${editedSubject}\n\n${editedBody}`;
    navigator.clipboard.writeText(fullEmailText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const handleSaveChanges = () => {
    setIsEditing(false);
  };

  const handleSaveToHistory = () => {
    if (!currentContent) return;
    onSave({ ...currentContent, subject: editedSubject, body: editedBody });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };
  
  const handleSendWithGmail = () => {
    if (!currentContent) return;
    const subject = encodeURIComponent(editedSubject);
    const body = encodeURIComponent(editedBody);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
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
    if (isLoading) {
      return <LoadingState />;
    }
    if (error) {
      return <ErrorState message={error} />;
    }
    if (contents && currentContent) {
      return (
        <div className="flex flex-col h-full">
          {contents.length > 1 && (
             <div className="flex border-b border-slate-200 dark:border-slate-700 -mx-6 px-4">
               {contents.map((_, index) => (
                   <button key={index} onClick={() => setSelectedVariation(index)} className={getTabClass(index)}>
                       Variation {index + 1}
                   </button>
               ))}
            </div>
          )}

          <div className="space-y-6 animate-fade-in text-left flex-grow pt-6 flex flex-col">
            {/* Email Content */}
            <div className="flex-grow space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Email subject"
                  />
                ) : (
                  <p className="w-full p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {editedSubject}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Body</h3>
                 {isEditing ? (
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={10}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
                    aria-label="Email body"
                  />
                ) : (
                  <div 
                    className="w-full p-3 h-64 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg leading-relaxed whitespace-pre-wrap"
                  >
                    {editedBody}
                  </div>
                )}
              </div>
              
              {/* Sources */}
               {currentContent.sources && currentContent.sources.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Sources</h3>
                  <ul className="space-y-2 text-sm">
                    {currentContent.sources.map((source, index) => (
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
            </div>

            {/* Regeneration Options */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
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
                onClick={handleSaveToHistory}
                disabled={hasSaved}
                className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {hasSaved ? (
                   <>
                    <Icon name="check" className="h-5 w-5 text-green-500" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Icon name="archive" className="h-5 w-5" />
                    Save to History
                  </>
                )}
              </button>
              {isEditing ? (
                 <button
                  onClick={handleSaveChanges}
                  className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 transition-colors"
                  >
                  <Icon name="save" className="h-5 w-5" />
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 transition-colors"
                  >
                  <Icon name="edit" className="h-5 w-5" />
                  Edit
                </button>
              )}
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
               <button
                onClick={handleSendWithGmail}
                className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
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

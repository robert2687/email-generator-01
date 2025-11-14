import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { STYLE_OPTIONS } from '../constants';
import type { EmailRequestData, EmailStyle } from '../types';
import { Icon } from './Icon';

interface EmailEditorProps {
  onGenerate: (formData: EmailRequestData) => void;
  isLoading: boolean;
}

export interface EmailEditorHandles {
  reset: () => void;
}

export const EmailEditor = forwardRef<EmailEditorHandles, EmailEditorProps>(({ onGenerate, isLoading }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<EmailStyle>('Friendly');
  const [useSearch, setUseSearch] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setPrompt('');
      setStyle('Friendly');
      setUseSearch(false);
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({ prompt, style, useSearch });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            What kind of email do you need?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A thank you note to my team for their hard work on the latest project."
            rows={4}
            required
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-base"
          />
        </div>

        {/* Style Selection */}
        <div className="mt-4">
          <h3 className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Choose a style</h3>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setStyle(s.name)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all ${
                  style === s.name
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500'
                }`}
              >
                <Icon name={s.icon} className="h-4 w-4" />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Toggle */}
        <div className="mt-6 flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg">
           <label htmlFor="use-search" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <Icon name="google" className="h-5 w-5 text-blue-600"/>
              <span>Use Google Search for up-to-date info</span>
           </label>
            <button
                type="button"
                onClick={() => setUseSearch(!useSearch)}
                className={`${useSearch ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
                id="use-search"
            >
                <span
                className={`${
                    useSearch ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>

      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !prompt}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Icon name="loader" className="animate-spin h-5 w-5" />
            Generating...
          </>
        ) : (
          <>
            <Icon name="sparkles" className="h-5 w-5" />
            Generate Email
          </>
        )}
      </button>
    </form>
  );
});
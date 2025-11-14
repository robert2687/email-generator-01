
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { STYLE_OPTIONS } from '../constants';
import type { EmailRequestData, EmailStyle, EmailTemplate } from '../types';
import { Icon } from './Icon';
import { SaveTemplateModal } from './SaveTemplateModal';

interface EmailEditorProps {
  onGenerate: (formData: EmailRequestData) => void;
  isLoading: boolean;
  templates: EmailTemplate[];
  onAddTemplate: (name: string, prompt: string) => void;
}

export interface EmailEditorHandles {
  reset: () => void;
  setPrompt: (text: string) => void;
}

export const EmailEditor = forwardRef<EmailEditorHandles, EmailEditorProps>(({ onGenerate, isLoading, templates, onAddTemplate }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<EmailStyle>('Friendly');
  const [useSearch, setUseSearch] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setPrompt('');
      setStyle('Friendly');
      setUseSearch(false);
    },
    setPrompt: (text: string) => {
      setPrompt(text);
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate({ prompt, style, useSearch });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setPrompt(selectedTemplate.prompt);
    } else if (templateId === "") {
        setPrompt('');
    }
  };

  return (
    <>
    <SaveTemplateModal 
      isOpen={isSaveModalOpen}
      onClose={() => setIsSaveModalOpen(false)}
      onSave={onAddTemplate}
      currentPrompt={prompt}
    />
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        {/* Templates */}
        <div>
          <label htmlFor="template-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Start from a template (optional)
          </label>
          <select 
            id="template-select"
            onChange={handleTemplateChange}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-base"
          >
            <option value="">-- Select a template --</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt" className="block text-lg font-semibold text-slate-800 dark:text-slate-100">
              What kind of email do you need?
            </label>
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              disabled={!prompt.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="save" className="h-3 w-3" />
              Save as template
            </button>
          </div>
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
    </>
  );
});

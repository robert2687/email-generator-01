
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, prompt: string) => void;
  currentPrompt: string;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave, currentPrompt }) => {
  const [templateName, setTemplateName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTemplateName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (!templateName.trim()) {
      setError('Template name cannot be empty.');
      return;
    }
    onSave(templateName, currentPrompt);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Save as Template</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Save the current prompt for future use.</p>
          
          <div className="mt-4">
            <label htmlFor="template-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Template Name
            </label>
            <input
              id="template-name"
              type="text"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Monthly Project Update"
              className={`w-full p-2 border rounded-lg shadow-sm focus:ring-2 bg-white dark:bg-slate-900 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'}`}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div className="mt-2">
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prompt to be saved:</p>
             <p className="text-sm text-slate-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md max-h-24 overflow-y-auto">
                {currentPrompt}
             </p>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icon name="save" className="h-4 w-4" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

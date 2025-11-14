
import React from 'react';
import type { GeneratedEmailContent } from '../types';
import { Icon } from './Icon';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedEmailContent[];
  onLoad: (email: GeneratedEmailContent) => void;
  onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 id="history-panel-title" className="text-lg font-semibold flex items-center gap-2">
              <Icon name="history" className="h-6 w-6" />
              Saved Emails
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close history panel"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-grow overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-6">
                <Icon name="archive" className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold">No Saved Emails</h3>
                <p>Emails you save will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {history.map(item => (
                  <li key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <button onClick={() => onLoad(item)} className="text-left flex-grow">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.subject}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.body}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                        </p>
                      </button>
                      <button 
                        onClick={() => onDelete(item.id!)} 
                        className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
                        aria-label={`Delete email titled "${item.subject}"`}
                      >
                        <Icon name="trash" className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

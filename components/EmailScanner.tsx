
import React, { useState } from 'react';
import { Icon } from './Icon';

interface EmailScannerProps {
  onScan: (subject: string, body: string) => void;
  isLoading: boolean;
}

export const EmailScanner: React.FC<EmailScannerProps> = ({ onScan, isLoading }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return; // Subject is optional, but body is required
    onScan(subject, body);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Analyze an Email and Generate a Reply
        </h2>

        {/* Subject Input */}
        <div>
          <label htmlFor="scan-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Subject (optional)
          </label>
          <input
            id="scan-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Re: Project Update"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-base"
          />
        </div>

        {/* Body Input */}
        <div className="mt-4">
          <label htmlFor="scan-body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Body
          </label>
          <textarea
            id="scan-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste the body of the email you received here."
            rows={8}
            required
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-base"
          />
        </div>

      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !body}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Icon name="loader" className="animate-spin h-5 w-5" />
            Scanning...
          </>
        ) : (
          <>
            <Icon name="scan" className="h-5 w-5" />
            Scan Email
          </>
        )}
      </button>
    </form>
  );
};

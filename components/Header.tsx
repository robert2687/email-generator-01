
import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
    isAuthenticated: boolean;
    onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignOut }) => {
  return (
    <header className="bg-white dark:bg-slate-900/70 shadow-sm backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="mail" className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Professional Email Generator
            </h1>
          </div>
          {isAuthenticated ? (
             <button
                onClick={onSignOut}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
             >
                <Icon name="sign-out" className="h-5 w-5" />
                Sign Out
             </button>
          ) : (
             <a
                href="https://ai.google.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
                Powered by <span className="font-semibold">Gemini</span>
                <Icon name="external-link" className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

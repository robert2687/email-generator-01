
import React, { useState } from 'react';
import { Icon } from './Icon';

interface HeaderProps {
    isAuthenticated: boolean;
    onSignOut: () => void;
    onToggleHistory: () => void;
    onToggleTemplates: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignOut, onToggleHistory, onToggleTemplates }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuLinkClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  }

  return (
    <header className="bg-white dark:bg-slate-900/70 shadow-sm backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="mail" className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              <span className="hidden sm:inline">Professional </span>Email Generator
            </h1>
          </div>
          {isAuthenticated ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-4">
                 <button
                    onClick={onToggleTemplates}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                 >
                    <Icon name="template" className="h-5 w-5" />
                    Templates
                 </button>
                 <button
                    onClick={onToggleHistory}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                 >
                    <Icon name="history" className="h-5 w-5" />
                    History
                 </button>
                 <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                 >
                    <Icon name="sign-out" className="h-5 w-5" />
                    Sign Out
                 </button>
              </div>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Open menu"
                >
                  <Icon name="menu" className="h-6 w-6" />
                </button>
              </div>
            </>
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
      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 shadow-lg animate-fade-in-down">
          <div className="flex flex-col p-4 space-y-2">
            <button
                onClick={() => handleMenuLinkClick(onToggleTemplates)}
                className="flex items-center gap-3 p-3 text-base rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
                <Icon name="template" className="h-5 w-5" />
                Templates
            </button>
            <button
                onClick={() => handleMenuLinkClick(onToggleHistory)}
                className="flex items-center gap-3 p-3 text-base rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
                <Icon name="history" className="h-5 w-5" />
                History
            </button>
            <button
                onClick={() => handleMenuLinkClick(onSignOut)}
                className="flex items-center gap-3 p-3 text-base rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
                <Icon name="sign-out" className="h-5 w-5" />
                Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

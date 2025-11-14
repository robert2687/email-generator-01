
import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { Icon } from '../Icon';

type AuthMode = 'signin' | 'signup';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');

  const getTabClass = (tabMode: AuthMode) => {
    const baseClasses = "w-full py-3 text-sm font-semibold text-center transition-colors duration-200 focus:outline-none";
    if (mode === tabMode) {
      return `${baseClasses} text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400`;
    }
    return `${baseClasses} text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-b-2 border-transparent`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Icon name="mail" className="h-12 w-12 text-blue-600 dark:text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
              Professional Email Generator
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {mode === 'signin' ? 'Welcome back! Please sign in.' : 'Create an account to get started.'}
            </p>
        </div>

        <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            <button onClick={() => setMode('signin')} className={getTabClass('signin')}>
              Sign In
            </button>
            <button onClick={() => setMode('signup')} className={getTabClass('signup')}>
              Sign Up
            </button>
          </div>
          
          {mode === 'signin' ? <SignInForm onSuccess={onAuthSuccess} /> : <SignUpForm onSuccess={onAuthSuccess} />}
        </div>
        
         <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
             <p>Powered by <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-500 hover:underline">Gemini</a></p>
         </div>
      </div>
    </div>
  );
};

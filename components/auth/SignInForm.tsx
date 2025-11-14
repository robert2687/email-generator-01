
import React, { useState } from 'react';
import { Input } from './Input';
import { Icon } from '../Icon';

interface SignInFormProps {
  onSuccess: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="email-signin"
        name="email"
        label="Email"
        type="email"
        icon="mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        id="password-signin"
        name="password"
        label="Password"
        type="password"
        icon="lock"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />
      <div className="flex items-center justify-end">
        <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset functionality is not implemented in this demo.'); }} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          Forgot password?
        </a>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <>
            <Icon name="loader" className="animate-spin h-5 w-5" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

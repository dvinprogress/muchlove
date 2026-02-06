'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type InputType = 'text' | 'email' | 'password' | 'url';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      error,
      icon,
      className = '',
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              w-full rounded-lg px-3 py-2 text-sm
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-rose-500 focus:ring-rose-500'
              }
              ${className}
            `}
            {...rest}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

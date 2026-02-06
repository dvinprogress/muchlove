'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(internalValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [internalValue, onChange]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-lg px-3 py-2 pl-10 pr-10 text-sm
          border border-slate-300
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
          focus:border-rose-500
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-slate-400 hover:text-slate-600
            transition-colors duration-200
            focus:outline-none
          "
          aria-label="Effacer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

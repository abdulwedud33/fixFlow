import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  required,
  ...props
}: InputProps) {
  const inputId = id || `input_${label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-danger-700">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        {...props}
        className={`w-full h-11 px-3.5 bg-white border rounded-btn text-sm text-slate-950 placeholder-slate-400 focus:outline-none transition-colors ${
          error
            ? "border-danger-700 focus:border-danger-700 focus:ring-1 focus:ring-danger-700"
            : "border-slate-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
        } ${className}`}
      />
      {error && <p className="text-xs text-danger-700 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  className = "",
  required,
  rows = 3,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea_${label.toLowerCase().replace(/\s+/g, "_")}`;

  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-danger-700">*</span>}
      </label>
      <textarea
        id={textareaId}
        required={required}
        rows={rows}
        {...props}
        className={`w-full p-3 bg-white border rounded-btn text-sm text-slate-950 placeholder-slate-400 focus:outline-none transition-colors ${
          error
            ? "border-danger-700 focus:border-danger-700 focus:ring-1 focus:ring-danger-700"
            : "border-slate-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
        } ${className}`}
      />
      {error && <p className="text-xs text-danger-700 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
}

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  required,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const inputId = id || (label ? `input_${label.toLowerCase().replace(/\s+/g, "_")}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-content-secondary tracking-wide">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-content-muted pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}_error` : helperText ? `${inputId}_helper` : undefined}
          {...props}
          className={`w-full h-10 bg-surface-card border rounded-btn text-sm text-content-primary placeholder:text-content-muted focus:outline-none transition-all duration-150 ${leftIcon ? "pl-9" : "px-3"
            } ${rightIcon ? "pr-9" : "px-3"} ${error
              ? "border-error focus:border-error focus:ring-1 focus:ring-error/50"
              : "border-border hover:border-border-strong focus:border-accent focus:ring-1 focus:ring-accent/40"
            } ${className}`}
        />
        {rightIcon && (
          <div className="absolute right-3 text-content-muted pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p id={`${inputId}_error`} className="text-xs text-error mt-1">{error}</p>}
      {!error && helperText && <p id={`${inputId}_helper`} className="text-xs text-content-muted mt-1">{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
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
  const textareaId = id || (label ? `textarea_${label.toLowerCase().replace(/\s+/g, "_")}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-content-secondary tracking-wide">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        required={required}
        rows={rows}
        {...props}
        className={`w-full px-3 py-2 bg-surface-card border rounded-btn text-sm text-content-primary placeholder:text-content-muted focus:outline-none transition-all duration-150 ${error
          ? "border-error focus:border-error focus:ring-1 focus:ring-error/50"
          : "border-border hover:border-border-strong focus:border-accent focus:ring-1 focus:ring-accent/40"
          } ${className}`}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-content-muted mt-1">{helperText}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Select({
  label,
  error,
  helperText,
  id,
  children,
  className = "",
  required,
  ...props
}: SelectProps) {
  const selectId = id || (label ? `select_${label.toLowerCase().replace(/\s+/g, "_")}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-content-secondary tracking-wide">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        {...props}
        className={`w-full h-10 px-3 bg-surface-card border rounded-btn text-sm text-content-primary focus:outline-none transition-all duration-150 ${error
          ? "border-error focus:border-error focus:ring-1 focus:ring-error/50"
          : "border-border hover:border-border-strong focus:border-accent focus:ring-1 focus:ring-accent/40"
          } ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-content-muted mt-1">{helperText}</p>}
    </div>
  );
}

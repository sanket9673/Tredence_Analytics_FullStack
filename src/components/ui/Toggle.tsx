import React, { forwardRef } from 'react'

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className = '', ...props }, ref) => {
    return (
      <label className={`inline-flex items-start gap-3 cursor-pointer ${className}`}>
        <span className="relative inline-flex h-6 w-10 shrink-0 items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            role="switch"
            {...props}
          />
          <span className="h-6 w-10 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500" />
          <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
        </span>
        {(label || description) && (
          <span className="flex flex-col">
            {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
            {description && <span className="text-xs text-slate-500">{description}</span>}
          </span>
        )}
      </label>
    )
  },
)
Toggle.displayName = 'Toggle'

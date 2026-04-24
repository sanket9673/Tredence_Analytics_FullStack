import React, { forwardRef } from 'react'

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input type="checkbox" className="sr-only" ref={ref} role="switch" {...props} />
          <div className="block bg-slate-200 w-10 h-6 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-500"></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${props.checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
        {label && <div className="ml-3 text-sm font-medium text-slate-700">{label}</div>}
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'

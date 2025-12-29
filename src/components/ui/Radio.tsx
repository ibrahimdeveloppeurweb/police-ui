import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  variant?: 'primary' | 'success' | 'danger' | 'warning'
  radioSize?: 'sm' | 'md' | 'lg'
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant = 'primary', radioSize = 'md', label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="inline-flex items-center gap-2">
        <input
          type="radio"
          id={radioId}
          className={cn(
            // Base styles
            'rounded-full border transition-all duration-300 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Size variants
            {
              'w-4 h-4': radioSize === 'sm',
              'w-5 h-5': radioSize === 'md',
              'w-6 h-6': radioSize === 'lg',
            },
            // Color variants
            {
              'border-gray-300 text-blue-600 focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-600': variant === 'primary',
              'border-gray-300 text-green-600 focus:ring-green-500 checked:bg-green-600 checked:border-green-600': variant === 'success',
              'border-gray-300 text-red-600 focus:ring-red-500 checked:bg-red-600 checked:border-red-600': variant === 'danger',
              'border-gray-300 text-orange-500 focus:ring-orange-500 checked:bg-orange-500 checked:border-orange-500': variant === 'warning',
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className={cn(
              'font-medium text-gray-700 cursor-pointer select-none',
              {
                'text-sm': radioSize === 'sm',
                'text-base': radioSize === 'md',
                'text-lg': radioSize === 'lg',
              }
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export { Radio }
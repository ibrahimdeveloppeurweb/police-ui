import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  variant?: 'primary' | 'success' | 'danger' | 'warning'
  checkboxSize?: 'sm' | 'md' | 'lg'
  label?: string
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant = 'primary', checkboxSize = 'md', label, id, onCheckedChange, onChange, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    // Gérer les deux types de handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Appeler onChange si fourni
      if (onChange) {
        onChange(e)
      }
      // Appeler onCheckedChange si fourni
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }
    
    return (
      <div className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            // Base styles
            'rounded border transition-all duration-300 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Size variants
            {
              'w-4 h-4': checkboxSize === 'sm',
              'w-5 h-5': checkboxSize === 'md',
              'w-6 h-6': checkboxSize === 'lg',
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
          onChange={handleChange}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'font-medium text-gray-700 cursor-pointer select-none',
              {
                'text-sm': checkboxSize === 'sm',
                'text-base': checkboxSize === 'md',
                'text-lg': checkboxSize === 'lg',
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

Checkbox.displayName = 'Checkbox'

export { Checkbox }

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning'
  inputSize?: 'sm' | 'md' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'md', ...props }, ref) => {
    return (
      <input
        className={cn(
          // Base styles
          'w-full rounded-lg border font-medium transition-all duration-300',
          'focus:outline-none focus:border-controle-blue',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-gray-400',
          // Size variants
          {
            'px-3 py-2 text-sm': inputSize === 'sm',
            'px-4 py-2.5 text-base': inputSize === 'md',
            'px-5 py-3 text-lg': inputSize === 'lg',
          },
          // Color variants 
          {
            'border-gray-300 bg-white text-gray-900 hover:border-gray-400': variant === 'default',
            'border-green-300 bg-green-50 text-green-900 hover:border-green-400': variant === 'success',
            'border-red-300 bg-red-50 text-red-900 hover:border-red-400': variant === 'danger',
            'border-orange-300 bg-orange-50 text-orange-900 hover:border-orange-400': variant === 'warning',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
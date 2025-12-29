import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:-translate-y-1 hover:shadow-lg cursor-pointer',
          // Size variants
          {
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          // Color variants
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
            'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg': variant === 'success',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg': variant === 'danger',
            'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-lg': variant === 'warning',
            'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500': variant === 'outline',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
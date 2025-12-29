import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning'
  textareaSize?: 'sm' | 'md' | 'lg'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', textareaSize = 'md', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          'w-full rounded-lg border font-medium transition-all duration-300',
          'focus:outline-none focus:border-controle-blue',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'placeholder:text-gray-400',
          'resize-y min-h-[100px]',
          // Size variants
          {
            'px-3 py-2 text-sm': textareaSize === 'sm',
            'px-4 py-2.5 text-base': textareaSize === 'md',
            'px-5 py-3 text-lg': textareaSize === 'lg',
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

Textarea.displayName = 'Textarea'

export { Textarea }
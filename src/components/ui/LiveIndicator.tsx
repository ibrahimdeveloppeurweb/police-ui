import { cn } from '@/lib/cn'

interface LiveIndicatorProps {
  label?: string
  className?: string
}

const LiveIndicator = ({ label = "TEMPS RÉEL", className }: LiveIndicatorProps) => {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-xs font-semibold',
      className
    )}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      {label}
    </div>
  )
}

export { LiveIndicator }
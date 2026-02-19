import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'border-transparent bg-primary-600 text-white',
  secondary: 'border-transparent bg-zinc-100 text-zinc-900',
  destructive: 'border-transparent bg-error-500 text-white',
  outline: 'text-zinc-900 border-zinc-200',
  success: 'border-transparent bg-success-500 text-white',
  warning: 'border-transparent bg-warning-500 text-white',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }

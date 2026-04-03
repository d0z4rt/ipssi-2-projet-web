import React from 'react'

type ErrorBannerProps = {
  message: string
  className?: string
  compact?: boolean
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  className = '',
  compact = false
}) => {
  const sizeClasses = compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'

  return (
    <div
      className={`rounded border border-red-500/40 bg-red-500/10 text-red-300 ${sizeClasses} ${className}`.trim()}
    >
      {message}
    </div>
  )
}

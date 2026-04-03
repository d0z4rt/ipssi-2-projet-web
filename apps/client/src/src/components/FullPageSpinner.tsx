import React from 'react'

type FullPageSpinnerProps = {
  className?: string
}

export const FullPageSpinner: React.FC<FullPageSpinnerProps> = ({
  className = ''
}) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-darkBg ${className}`.trim()}
    >
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

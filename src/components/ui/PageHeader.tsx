import type { ReactNode } from 'react'
import Button from '@/components/ui/Button'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  backButtonLabel?: string
  backButtonVariant?: 'primary' | 'secondary' | 'outline'
  backButtonSize?: 'sm' | 'md' | 'lg'
  backButtonClassName?: string
  backButtonIcon?: ReactNode
  rightSlot?: ReactNode
  rightSlotWidthClassName?: string
  className?: string
  titleClassName?: string
}

function PageHeader({
  title,
  onBack,
  backButtonLabel,
  backButtonVariant = 'outline',
  backButtonSize = 'sm',
  backButtonClassName = '',
  backButtonIcon,
  rightSlot,
  rightSlotWidthClassName = 'w-[140px]',
  className = '',
  titleClassName = 'text-lg font-semibold text-gray-900'
}: PageHeaderProps) {
  const renderBackButton = () => {
    if (!onBack) {
      return <div className="w-10" />
    }

    return (
      <Button
        variant={backButtonVariant}
        size={backButtonSize}
        onClick={onBack}
        className={`flex items-center gap-2 ${backButtonClassName}`}
      >
        {backButtonIcon ?? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        )}
        {backButtonLabel && <span>{backButtonLabel}</span>}
      </Button>
    )
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-2 ${className}`}>
      {renderBackButton()}
      <h1 className={`flex-1 text-center ${titleClassName}`}>
        {title}
      </h1>
{/*       <div className={`${rightSlotWidthClassName} flex justify-end`}>
        {rightSlot}
      </div> */}
    </div>
  )
}

export default PageHeader

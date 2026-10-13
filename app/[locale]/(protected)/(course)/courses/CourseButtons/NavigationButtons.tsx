'use client'
import React from "react"
import { Button } from "@/components/ui/button"

interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  isNextDisabled?: boolean
  isLoading?: boolean
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  isNextDisabled = false,
  isLoading = false,
}) => {
  return (
    <div className="flex justify-between gap-3">
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          {backLabel}
        </Button>
      )}

      {onNext && (
        <Button
          onClick={onNext}
          disabled={isNextDisabled || isLoading}
        >
          {isLoading ? "Processing..." : nextLabel}
        </Button>
      )}
    </div>
  )
}

export default NavigationButtons
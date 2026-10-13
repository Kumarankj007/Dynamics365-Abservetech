'use client'
import React from "react"
import { Button } from "@/components/ui/button"

interface CourseButtonsProps {
  onBack?: () => void
  onNext?: () => void
  onNextOnly?: () => void
  onSaveDraft?: () => void
  backLabel?: string
  nextLabel?: string
  nextOnly?: string
  draftLabel?: string
  isNextDisabled?: boolean
  isLoading?: boolean
}

const CourseButtons: React.FC<CourseButtonsProps> = ({
  onBack,
  onNext,
  onNextOnly,
  onSaveDraft,
  backLabel = "Back",
  nextLabel = "Save",
  nextOnly = "Next",
  draftLabel = "Save Draft",
  isNextDisabled = false,
  isLoading = false,
}) => {
  return (
    <div className="flex justify-between pt-6">
      {onBack ? (
        <Button variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
      ) : (
        <div />
      )}

      <div className="flex flex-col md:flex-row gap-3">
        {onSaveDraft && (
          <Button variant="outline" onClick={onSaveDraft}>
            {draftLabel}
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

        {onNextOnly && (
          <Button
            onClick={onNextOnly}
            variant="outline"
          >
            {nextOnly}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CourseButtons
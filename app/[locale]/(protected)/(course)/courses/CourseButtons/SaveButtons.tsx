'use client'
import React from "react"
import { Button } from "@/components/ui/button"

interface SaveButtonsProps {
  onSaveDraft?: () => void
  onSaveContinue?: () => void
  draftLabel?: string
  continueLabel?: string
  isLoading?: boolean
}

const SaveButtons: React.FC<SaveButtonsProps> = ({
  onSaveDraft,
  onSaveContinue,
  draftLabel = "Save Draft",
  continueLabel = "Save & Continue",
  isLoading = false,
}) => {
  return (
    <div className="flex gap-3 justify-end">
      {onSaveDraft && (
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isLoading}
        >
          {draftLabel}
        </Button>
      )}

      {onSaveContinue && (
        <Button
          onClick={onSaveContinue}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : continueLabel}
        </Button>
      )}
    </div>
  )
}

export default SaveButtons
import React from 'react'

type ConfirmDeleteModalProps = {
  isOpen: boolean
  isDeleting: boolean
  title?: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
  deletingLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  isDeleting,
  title = 'Confirmer la suppression',
  description = 'Cette action supprimera definitivement la critique.',
  cancelLabel = 'Annuler',
  confirmLabel = 'Confirmer',
  deletingLabel = 'Suppression...',
  onCancel,
  onConfirm
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-cardBg p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? deletingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

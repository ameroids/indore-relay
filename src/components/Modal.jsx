import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

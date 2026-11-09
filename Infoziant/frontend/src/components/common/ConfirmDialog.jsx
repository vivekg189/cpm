import Modal from './Modal'
import Button from './Button'
import { AlertTriangle, Trash2 } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  icon: CustomIcon,
}) {
  const IconComponent = CustomIcon || (isDestructive ? Trash2 : AlertTriangle)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title=""
      showClose={!isLoading}
    >
      <div className="confirm-modal-content">
        <div className={`confirm-icon-box ${isDestructive ? 'destructive' : 'warning'}`}>
          <IconComponent size={28} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-desc">{message}</p>
        <div className="confirm-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}


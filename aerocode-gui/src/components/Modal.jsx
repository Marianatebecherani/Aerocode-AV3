import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Trash2, X } from 'lucide-react';

const variantStyles = {
  default: {
    iconWrap: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
  danger: {
    iconWrap: 'bg-red-500/15 text-red-300 border-red-500/30',
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  success: {
    iconWrap: 'bg-green-500/15 text-green-300 border-green-500/30',
    confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  },
};

function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  variant = 'default',
  children,
  footer,
  closeOnBackdrop = true,
  maxWidth = 'max-w-md',
}) {
  const styles = variantStyles[variant] || variantStyles.default;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar modal"
        onClick={handleBackdropClick}
      />

      <div
        className={`relative w-full ${maxWidth} rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex gap-4 pr-8">
          {Icon && (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${styles.iconWrap}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0">
            <h2 id="modal-title" className="text-xl font-bold text-white">
              {title}
            </h2>
            {description && <p className="mt-2 text-sm leading-6 text-gray-300">{description}</p>}
          </div>
        </div>

        {children && <div className="mt-5 text-sm text-gray-300">{children}</div>}

        {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

function ModalButton({ children, variant = 'secondary', isLoading = false, ...props }) {
  const baseClass = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-60';
  const variantClass = {
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  }[variant];

  return (
    <button type="button" className={`${baseClass} ${variantClass}`} {...props} disabled={isLoading || props.disabled}>
      {isLoading ? 'Processando...' : children}
    </button>
  );
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Deseja continuar com esta operação?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={AlertTriangle}
      variant="default"
      closeOnBackdrop={!isLoading}
      footer={(
        <>
          <ModalButton onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </ModalButton>
          <ModalButton variant="primary" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </ModalButton>
        </>
      )}
    />
  );
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemLabel = 'este item',
  title = 'Excluir item',
  description,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description || `Tem certeza que deseja excluir ${itemLabel}? Esta ação não pode ser desfeita.`}
      icon={Trash2}
      variant="danger"
      closeOnBackdrop={!isLoading}
      footer={(
        <>
          <ModalButton onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </ModalButton>
          <ModalButton variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </ModalButton>
        </>
      )}
    />
  );
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Operação realizada',
  description = 'A solicitação foi concluída com sucesso.',
  confirmLabel = 'Entendi',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={CheckCircle}
      variant="success"
      footer={(
        <ModalButton variant="success" onClick={onClose}>
          {confirmLabel}
        </ModalButton>
      )}
    />
  );
}

export function ErrorModal({
  isOpen,
  onClose,
  title = 'Não foi possível concluir',
  description = 'A solicitação não pode ser concluída.',
  confirmLabel = 'Entendi',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={AlertTriangle}
      variant="danger"
      footer={(
        <ModalButton variant="danger" onClick={onClose}>
          {confirmLabel}
        </ModalButton>
      )}
    />
  );
}

export default Modal;

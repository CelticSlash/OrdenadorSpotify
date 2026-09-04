function Toast({ toast, onClose }) {
  if (!toast) return null

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">
        {toast.type === "success" ? "✓" : "!"}
      </div>

      <div className="toast-content">
        <strong>{toast.title}</strong>
        <span>{toast.message}</span>
      </div>

      <button className="toast-close" onClick={onClose} aria-label="Fechar">
        ×
      </button>
    </div>
  )
}

export default Toast
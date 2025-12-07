import './ConfirmDialog.css';

function ConfirmDialog({ 
  titulo, 
  mensagem, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  tipo = 'danger' // 'danger', 'warning', 'info'
}) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className={`dialog-header ${tipo}`}>
          <h3>{titulo}</h3>
        </div>
        
        <div className="dialog-body">
          <p>{mensagem}</p>
        </div>
        
        <div className="dialog-footer">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-${tipo}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
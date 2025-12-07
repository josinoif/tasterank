import './EmptyState.css';

function EmptyState({ 
  icone = '📭', 
  titulo, 
  mensagem, 
  action 
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icone}</div>
      <h3>{titulo}</h3>
      <p>{mensagem}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
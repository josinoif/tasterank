'use client';

import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">❌</div>
      <h3>Ops! Algo deu errado</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          🔄 Tentar Novamente
        </button>
      )}
    </div>
  );
}

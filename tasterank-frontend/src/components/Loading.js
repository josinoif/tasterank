import './Loading.css';

export default function Loading({ message = 'Carregando...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
'use client';

import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  
  // Lógica para mostrar páginas (ex: 1 ... 4 5 6 ... 10)
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-button"
      >
        ← Anterior
      </button>
      
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="page-number">
            1
          </button>
          {startPage > 2 && <span className="ellipsis">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`page-number ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="ellipsis">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="page-number">
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-button"
      >
        Próxima →
      </button>
    </div>
  );
}

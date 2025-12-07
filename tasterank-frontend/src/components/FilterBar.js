'use client';

import './FilterBar.css';

export default function FilterBar({ 
  categoria, 
  onCategoriaChange, 
  ordenacao, 
  onOrdenacaoChange 
}) {
  const categorias = [
    'Todas',
    'Italiana',
    'Japonesa',
    'Brasileira',
    'Mexicana',
    'Árabe',
    'Hamburgueria',
    'Pizzaria',
    'Vegetariana',
    'Outra'
  ];
  
  const opcoesOrdenacao = [
    { value: 'avaliacao_media', label: 'Melhor Avaliados' },
    { value: 'nome', label: 'Nome (A-Z)' },
    { value: 'created_at', label: 'Mais Recentes' }
  ];
  
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Categoria:</label>
        <select 
          value={categoria}
          onChange={(e) => onCategoriaChange(e.target.value === 'Todas' ? '' : e.target.value)}
          className="filter-select"
        >
          {categorias.map(cat => (
            <option key={cat} value={cat === 'Todas' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label>Ordenar por:</label>
        <select
          value={ordenacao}
          onChange={(e) => onOrdenacaoChange(e.target.value)}
          className="filter-select"
        >
          {opcoesOrdenacao.map(opcao => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
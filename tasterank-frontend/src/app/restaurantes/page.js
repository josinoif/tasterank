'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import restauranteService from '@/services/restauranteService';
import RestauranteCard from '@/components/RestauranteCard';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import Pagination from '@/components/Pagination';
import './restaurantes.css';

export default function RestaurantesPage() {
  const searchParams = useSearchParams();
  
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros (sincronizados com URL)
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [categoriaFiltro, setCategoriaFiltro] = useState(searchParams.get('categoria') || '');
  const [ordenacao, setOrdenacao] = useState(searchParams.get('ordenacao') || 'avaliacao_media');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    buscarRestaurantes();
  }, [busca, categoriaFiltro, ordenacao, page]);
  
  const buscarRestaurantes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: 12,
        ...(busca && { busca }),
        ...(categoriaFiltro && { categoria: categoriaFiltro }),
        ordenar: ordenacao,
        direcao: 'DESC'
      };
      
      const data = await restauranteService.getAll(params);
      
      setRestaurantes(data.restaurantes || []);
      setTotalPages(data.totalPaginas || 1);
      
      // Atualizar URL sem recarregar
      const urlParams = new URLSearchParams();
      if (busca) urlParams.set('busca', busca);
      if (categoriaFiltro) urlParams.set('categoria', categoriaFiltro);
      if (ordenacao) urlParams.set('ordenacao', ordenacao);
      if (page > 1) urlParams.set('page', page);
      
      window.history.replaceState(null, '', `?${urlParams.toString()}`);
      
    } catch (err) {
      setError(err.error || 'Erro ao carregar restaurantes');
      console.error('Erro ao buscar restaurantes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (termo) => {
    setBusca(termo);
    setPage(1); // Resetar para primeira página
  };
  
  const handleCategoriaChange = (categoria) => {
    setCategoriaFiltro(categoria);
    setPage(1);
  };
  
  const handleOrdenacaoChange = (ordem) => {
    setOrdenacao(ordem);
  };
  
  if (loading && page === 1) {
    return <Loading />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={buscarRestaurantes} 
      />
    );
  }
  
  return (
    <div className="restaurantes-list-page">
      <header className="page-header">
        <h1>Restaurantes</h1>
        <p>Encontre os melhores lugares para comer</p>
      </header>
      
      <div className="filters-section">
        <SearchBar 
          value={busca}
          onChange={handleSearch}
          placeholder="Buscar restaurantes..."
        />
        
        <FilterBar
          categoria={categoriaFiltro}
          onCategoriaChange={handleCategoriaChange}
          ordenacao={ordenacao}
          onOrdenacaoChange={handleOrdenacaoChange}
        />
      </div>
      
      {restaurantes.length === 0 ? (
        <div className="no-results">
          <h3>Nenhum restaurante encontrado</h3>
          <p>Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <>
          <div className="restaurantes-grid">
            {restaurantes.map(restaurante => (
              <RestauranteCard 
                key={restaurante.id} 
                restaurante={restaurante} 
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import restauranteService from '@/services/restauranteService';

export default function ApiTest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const testarConexao = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await restauranteService.getAll({ limit: 5 });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={testarConexao}>Testar API</button>
      {loading && <p>Carregando...</p>}
      {error && <p style={{color: 'red'}}>Erro: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
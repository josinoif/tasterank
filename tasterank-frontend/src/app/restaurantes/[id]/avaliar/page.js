'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import notificacao from '@/services/notificacao';
import avaliacaoService from '@/services/avaliacaoService';
import restauranteService from '@/services/restauranteService';
import RatingStars from '@/components/RatingStars';
import './page.css';

export default function AvaliacaoForm({ params }) {
  const { id } = use(params); // ID do restaurante
  const router = useRouter();
  
  const [restaurante, setRestaurante] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [autor, setAutor] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    buscarRestaurante();
  }, [id]);
  
  const buscarRestaurante = async () => {
    try {
      const data = await restauranteService.getById(id);
      setRestaurante(data);
    } catch (err) {
      setError('Restaurante não encontrado');
      notificacao.erro('Restaurante não encontrado');
    }
  };
  
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!autor.trim()) {
      novosErros.autor = 'Nome do autor é obrigatório';
    } else if (autor.trim().length < 2) {
      novosErros.autor = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (nota === 0) {
      novosErros.nota = 'Selecione uma nota de 1 a 5';
    }
    
    if (nota < 1 || nota > 5) {
      novosErros.nota = 'A nota deve estar entre 1 e 5';
    }
    
    if (comentario.trim() === '') {
      novosErros.comentario = 'O comentário é obrigatório';
    } else if (comentario.trim().length < 10) {
      novosErros.comentario = 'O comentário deve ter pelo menos 10 caracteres';
    } else if (comentario.length > 500) {
      novosErros.comentario = 'O comentário deve ter no máximo 500 caracteres';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      notificacao.aviso('Preencha todos os campos corretamente');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let restaurante_id = parseInt(id);
      const dados = {
        restaurante_id: restaurante_id,
        nota: parseFloat(nota),
        comentario: comentario.trim(),
        autor: autor.trim()
      };
      
      await avaliacaoService.create(restaurante_id, dados);
      
      // Usar notificação ao invés de alert
      notificacao.sucesso('Avaliação enviada com sucesso!');
      router.push(`/restaurantes/${id}`);
      
    } catch (err) {
      setError(err.error || 'Erro ao enviar avaliação');
      
      // Se o backend retornar erros de validação
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotaChange = (novaNota) => {
    setNota(novaNota);
    
    // Limpar erro quando usuário seleciona nota
    if (errors.nota) {
      setErrors(prev => ({ ...prev, nota: null }));
    }
  };
  
  const handleComentarioChange = (e) => {
    setComentario(e.target.value);
    
    // Limpar erro quando usuário digita
    if (errors.comentario) {
      setErrors(prev => ({ ...prev, comentario: null }));
    }
  };
  
  const handleAutorChange = (e) => {
    setAutor(e.target.value);
    
    // Limpar erro quando usuário digita
    if (errors.autor) {
      setErrors(prev => ({ ...prev, autor: null }));
    }
  };
  
  if (!restaurante) {
    return <div className="loading">Carregando...</div>;
  }
  
  return (
    <div className="avaliacao-form-page">
      <div className="form-header">
        <h1>Avaliar Restaurante</h1>
        <p className="restaurante-nome">📍 {restaurante.nome}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="avaliacao-form">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="autor">
            Seu Nome <span className="required">*</span>
          </label>
          <input
            type="text"
            id="autor"
            value={autor}
            onChange={handleAutorChange}
            placeholder="Digite seu nome"
            maxLength={100}
            className={errors.autor ? 'error' : ''}
          />
          {errors.autor && (
            <span className="error-message">{errors.autor}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="nota">
            Nota <span className="required">*</span>
          </label>
          <div className="nota-selector">
            <RatingStars
              rating={nota}
              size="large"
              interactive={true}
              onChange={handleNotaChange}
            />
            <span className="nota-numero">
              {nota > 0 ? nota.toFixed(1) : 'Clique para selecionar'}
            </span>
          </div>
          {errors.nota && (
            <span className="error-message">{errors.nota}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="comentario">
            Comentário <span className="required">*</span>
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={handleComentarioChange}
            placeholder="Compartilhe sua experiência..."
            rows={6}
            maxLength={500}
            className={errors.comentario ? 'error' : ''}
          />
          <div className="textarea-info">
            <span className="char-count">{comentario.length}/500</span>
          </div>
          {errors.comentario && (
            <span className="error-message">{errors.comentario}</span>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      </form>
    </div>
  );
}
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import restauranteService from '@/services/restauranteService';

export default function RestauranteForm({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    endereco: '',
    telefone: '',
    site: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEdit) {
      buscarRestaurante();
    }
  }, [id]);
  
  const buscarRestaurante = async () => {
    try {
      const data = await restauranteService.getById(id);
      setFormData({
        nome: data.nome || '',
        categoria: data.categoria || '',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        site: data.site || ''
      });
    } catch (err) {
      alert('Erro ao carregar restaurante');
      router.push('/restaurantes');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    
    if (!formData.categoria) {
      novosErros.categoria = 'Categoria é obrigatória';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEdit) {
        await restauranteService.update(id, formData);
        alert('Restaurante atualizado com sucesso!');
      } else {
        const response = await restauranteService.create(formData);
        alert('Restaurante criado com sucesso!');
        router.push(`/restaurantes/${response.id}`);
        return;
      }
      
      router.push(`/restaurantes/${id}`);
      
    } catch (err) {
      alert(err.error || 'Erro ao salvar restaurante');
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="restaurante-form-page">
      <h1>{isEdit ? 'Editar' : 'Novo'} Restaurante</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nome *</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={errors.nome ? 'error' : ''}
          />
          {errors.nome && <span className="error-message">{errors.nome}</span>}
        </div>
        
        <div className="form-group">
          <label>Categoria *</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className={errors.categoria ? 'error' : ''}
          >
            <option value="">Selecione...</option>
            <option value="Italiana">Italiana</option>
            <option value="Japonesa">Japonesa</option>
            <option value="Brasileira">Brasileira</option>
            <option value="Mexicana">Mexicana</option>
            <option value="Árabe">Árabe</option>
            <option value="Hamburgueria">Hamburgueria</option>
            <option value="Pizzaria">Pizzaria</option>
            <option value="Vegetariana">Vegetariana</option>
            <option value="Outra">Outra</option>
          </select>
          {errors.categoria && <span className="error-message">{errors.categoria}</span>}
        </div>
        
        <div className="form-group">
          <label>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Telefone</label>
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="site"
            value={formData.site}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
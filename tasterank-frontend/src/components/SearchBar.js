'use client';

import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  const [inputValue, setInputValue] = useState(value);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(inputValue);
  };
  
  const handleClear = () => {
    setInputValue('');
    onChange('');
  };
  
  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      
      {inputValue && (
        <button 
          type="button" 
          onClick={handleClear}
          className="clear-button"
        >
          ✕
        </button>
      )}
      
      <button type="submit" className="search-button">
        🔍 Buscar
      </button>
    </form>
  );
}
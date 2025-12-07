'use client';

import Link from 'next/link';
import './RestauranteCard.css';

export default function RestauranteCard({ restaurante }) {
  const { id, nome, categoria, endereco, avaliacao_media } = restaurante;
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    
    return stars;
  };
  
  return (
    <Link href={`/restaurantes/${id}`} className="restaurante-card">
      <div className="card-header">
        <h3>{nome}</h3>
        <span className="categoria-badge">{categoria}</span>
      </div>
      
      <div className="card-body">
        {endereco && (
          <p className="endereco">📍 {endereco}</p>
        )}
        
        <div className="rating">
          <div className="stars">
            {renderStars(parseFloat(avaliacao_media) || 0)}
          </div>
          <span className="rating-number">
            {parseFloat(avaliacao_media).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
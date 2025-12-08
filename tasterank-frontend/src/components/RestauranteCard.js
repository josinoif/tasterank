'use client';

import Link from 'next/link';
import Image from 'next/image';
import './RestauranteCard.css';

export default function RestauranteCard({ restaurante }) {
  const { id, nome, categoria, endereco, avaliacao_media, imagem } = restaurante;
  
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
      {imagem && (
        <div className="card-image">
          <Image
            src={imagem}
            alt={nome}
            width={300}
            height={200}
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect fill='%23f0f0f0'/%3E%3C/svg%3E"
          />
        </div>
      )}
      
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
'use client';

import './RatingStars.css';

export default function RatingStars({ 
  rating = 0, 
  size = 'medium',
  interactive = false,
  onChange = null
}) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const renderStar = (index) => {
    let starClass = 'empty';
    
    if (index < fullStars) {
      starClass = 'full';
    } else if (index === fullStars && hasHalfStar) {
      starClass = 'half';
    }
    
    if (interactive) {
      return (
        <button
          key={index}
          type="button"
          className={`star ${starClass} interactive`}
          onClick={() => onChange?.(index + 1)}
          onMouseEnter={() => {
            // Hover effect opcional
          }}
        >
          ★
        </button>
      );
    }
    
    return (
      <span key={index} className={`star ${starClass}`}>
        ★
      </span>
    );
  };
  
  for (let i = 0; i < 5; i++) {
    stars.push(renderStar(i));
  }
  
  return (
    <div className={`rating-stars size-${size} ${interactive ? 'interactive' : ''}`}>
      {stars}
    </div>
  );
}
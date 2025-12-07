'use client';

import { useState } from 'react';
import './RatingStars.css';

export default function RatingStars({ rating, size = 'medium', interactive = false, onChange }) {
  const [hoveredStar, setHoveredStar] = useState(null);
  
  const displayRating = interactive && hoveredStar !== null ? hoveredStar : rating;
  
  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };
  
  const handleMouseEnter = (index) => {
    if (interactive) {
      setHoveredStar(index + 1);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredStar(null);
    }
  };
  
  const stars = [];
  
  for (let i = 0; i < 5; i++) {
    const filled = i < Math.floor(displayRating);
    
    stars.push(
      <span
        key={i}
        className={`star ${filled ? 'full' : 'empty'} ${size} ${interactive ? 'interactive' : ''}`}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
      >
        {filled ? '★' : '☆'}
      </span>
    );
  }
  
  return <div className="rating-stars">{stars}</div>;
}
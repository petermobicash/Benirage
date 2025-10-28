import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'glass';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  onClick 
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md p-4 sm:p-6',
    premium: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl p-6 sm:p-8',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg p-4 sm:p-6'
  };

  const clickableClasses = onClick ? 'cursor-pointer hover:scale-105' : '';

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
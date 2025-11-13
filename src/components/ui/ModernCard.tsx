import { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

const ModernCard = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = true,
  onClick,
  ariaLabel
}: ModernCardProps) => {
  const baseClasses = 'card-modern transition-all duration-200';
  
  const variantClasses = {
    default: '',
    elevated: 'shadow-large',
    outlined: 'border-2 border-gray-200'
  };
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover-lift cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${hoverClasses} ${clickableClasses} ${className}`.trim();
  
  const CardWrapper = onClick ? 'button' : 'div';
  
  return (
    <CardWrapper
      className={finalClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      {...(onClick && { role: 'button', tabIndex: 0 })}
    >
      {children}
    </CardWrapper>
  );
};

export default ModernCard;
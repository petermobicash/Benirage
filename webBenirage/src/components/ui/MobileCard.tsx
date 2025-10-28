import { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

const MobileCard = ({
  children,
  className = '',
  onClick,
  padding = 'md',
  shadow = 'md'
}: MobileCardProps) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const cardClasses = `
    mobile-card
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${onClick ? 'cursor-pointer active:scale-98 transition-transform duration-150' : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default MobileCard;
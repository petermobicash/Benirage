import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const baseClasses = 'font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation -webkit-tap-highlight-color-transparent';
  
  const variantClasses = {
    primary: 'bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500',
    secondary: 'bg-yellow-500 text-blue-900 hover:bg-yellow-400 focus:ring-yellow-500',
    outline: 'border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white focus:ring-blue-500',
    ghost: 'text-blue-900 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-sm min-h-[40px] sm:min-h-[44px]',
    md: 'px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base min-h-[44px] sm:min-h-[48px]',
    lg: 'px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[52px]',
    xl: 'px-8 sm:px-10 py-5 sm:py-5 text-lg sm:text-xl min-h-[52px] sm:min-h-[56px]'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      <div className="flex items-center justify-center space-x-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children && <span>{children}</span>}
      </div>
    </button>
  );
};

export default Button;
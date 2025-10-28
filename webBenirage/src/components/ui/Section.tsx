import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'blue' | 'cultural' | 'premium';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  background = 'white',
  padding = 'lg'
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    cultural: 'bg-gradient-to-br from-gray-50 to-blue-50',
    premium: 'bg-gradient-to-br from-white via-gray-50 to-blue-50'
  };

  const paddingClasses = {
    sm: 'py-8 sm:py-12 px-4 sm:px-6 lg:px-8',
    md: 'py-12 sm:py-16 px-4 sm:px-6 lg:px-8',
    lg: 'py-16 sm:py-20 px-4 sm:px-6 lg:px-8',
    xl: 'py-20 sm:py-24 px-4 sm:px-6 lg:px-8'
  };

  return (
    <section className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
};

export default Section;
import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'blue' | 'cultural' | 'premium';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  background = 'white',
  padding = 'lg',
  id
}) => {
  const backgroundClasses = {
    white: 'bg-neutral-white',
    gray: 'bg-neutral-cloud-white',
    blue: 'bg-brand-main-50',
    teal: 'bg-brand-middle-50',
    cultural: 'bg-gradient-to-br from-brand-main-50 to-brand-middle-50',
    premium: 'bg-gradient-to-br from-neutral-white via-neutral-cloud-white to-brand-main-50'
  };

  const paddingClasses = {
    sm: 'py-8 sm:py-12 px-4 sm:px-6 lg:px-8',
    md: 'py-12 sm:py-16 px-4 sm:px-6 lg:px-8',
    lg: 'py-16 sm:py-20 px-4 sm:px-6 lg:px-8',
    xl: 'py-20 sm:py-24 px-4 sm:px-6 lg:px-8'
  };

  return (
    <section
      className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
      id={id}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
};

export default Section;
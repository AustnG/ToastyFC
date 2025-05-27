
import React from 'react';
import { ACCENT_COLOR } from '../../constants';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  titleClassName?: string;
  titleTag?: 'h2' | 'h3' | 'h4'; 
  icon?: React.ReactNode; // Optional icon to display next to the title
}

const Card: React.FC<CardProps> = ({
  title,
  className = 'bg-white',
  children,
  titleClassName = `text-[${ACCENT_COLOR}] text-2xl font-semibold mb-4`,
  titleTag: TitleTag = 'h3', 
  icon
}) => {
  const titleId = title ? title.toLowerCase().replace(/\s+/g, '-') + "-heading" : undefined;
  return (
    <section className={`rounded-xl shadow-xl p-6 md:p-8 ${className}`} aria-labelledby={titleId}>
      {title && (
        <TitleTag id={titleId} className={`${titleClassName} flex items-center`}>
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </TitleTag>
      )}
      {children}
    </section>
  );
};

export default Card;
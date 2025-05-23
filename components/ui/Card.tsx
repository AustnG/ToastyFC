
import React from 'react';
import { ACCENT_COLOR } from '../../constants';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  titleClassName?: string;
  titleTag?: 'h2' | 'h3' | 'h4'; // Optional: allow specifying the heading tag for semantic HTML
}

const Card: React.FC<CardProps> = ({ 
  title, 
  className = 'bg-white', 
  children, 
  titleClassName = `text-[${ACCENT_COLOR}] text-2xl font-semibold mb-4`,
  titleTag: TitleTag = 'h3' // Default to h3 for card titles
}) => {
  return (
    <section className={`rounded-xl shadow-xl p-6 md:p-8 ${className}`} aria-labelledby={title ? title.toLowerCase().replace(/\s+/g, '-') + "-heading" : undefined}>
      {title && <TitleTag id={title.toLowerCase().replace(/\s+/g, '-') + "-heading"} className={titleClassName}>{title}</TitleTag>}
      {children}
    </section>
  );
};

export default Card;

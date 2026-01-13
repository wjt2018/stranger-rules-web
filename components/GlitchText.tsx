import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", as = 'span' }) => {
  const Component = as as any;
  
  return (
    <Component className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] opacity-0 group-hover:opacity-70 group-hover:animate-pulse text-red-500 bg-black -z-10 mix-blend-screen">
        {text}
      </span>
      <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] opacity-0 group-hover:opacity-70 group-hover:animate-pulse delay-75 text-cyan-500 bg-black -z-10 mix-blend-screen">
        {text}
      </span>
    </Component>
  );
};

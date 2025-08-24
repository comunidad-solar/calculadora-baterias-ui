import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para que la transición sea visible
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        .page-enter {
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 8}px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <div className={`page-enter ${className}`}>
        {children}
      </div>
    </>
  );
};

export default PageTransition;

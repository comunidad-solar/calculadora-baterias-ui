import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
}

const BackButton = ({ to, className = "btn btn-link text-muted p-0 mb-3 d-inline-flex align-items-center text-decoration-none", children = "← Volver" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      className={className} 
      onClick={handleClick}
      style={{
        fontSize: '0.9rem',
        fontWeight: '500',
        border: 'none',
        background: 'none',
        transition: 'color 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#495057'}
      onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
    >
      {children}
    </button>
  );
};

export default BackButton;

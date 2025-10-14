import React from 'react';
import { useAsesores } from '../hooks/useAsesores';

interface DealLoaderProps {
  children: React.ReactNode;
}

/**
 * Componente que maneja la carga de deals en modo asesores
 * Muestra un loader mientras se carga el deal y maneja errores
 */
export const DealLoader: React.FC<DealLoaderProps> = ({ children }) => {
  const { 
    isAsesores, 
    hasValidDeal, 
    isLoadingDeal, 
    dealError
  } = useAsesores();

  // Si no es modo asesores, renderizar normalmente
  if (!isAsesores) {
    return <>{children}</>;
  }

  // Si es modo asesores pero no hay deal válido, renderizar normalmente
  if (!hasValidDeal()) {
    return <>{children}</>;
  }

  // Si hay error cargando el deal
  if (dealError) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Error cargando información
            </h4>
            <p className="mb-0">
              No se pudo cargar la información del deal: {dealError}
            </p>
            <hr />
            <p className="mb-0">
              <small>Por favor, verifica el enlace e inténtalo de nuevo.</small>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si está cargando el deal
  if (isLoadingDeal) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h4 className="text-muted">
            <i className="fas fa-database me-2"></i>
            Cargando información del deal...
          </h4>
          <p className="text-muted mb-0">
            <small>Obteniendo datos del servidor</small>
          </p>
        </div>
      </div>
    );
  }

  // Si ya se cargó correctamente, renderizar children
  return <>{children}</>;
};

export default DealLoader;
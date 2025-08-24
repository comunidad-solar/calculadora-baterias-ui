import { useUsuario } from '../context/UsuarioContext';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import PageTransition from './PageTransition';

const Propuesta = () => {
  const { validacionData, usuario } = useUsuario();
  const navigate = useNavigate();

  if (!validacionData || !usuario || !validacionData.enZona) {
    navigate('/');
    return null;
  }

  return (
    <PageTransition>
      <div className="container py-4">
      <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 900}}>
        <BackButton />
        
        <div className="text-center mb-5">
          <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
            <span style={{fontSize: '2.5rem'}}>📋</span>
          </div>
          <h2 className="h3 fw-bold mb-2">Propuesta Personalizada</h2>
          <p className="text-muted">
            Basada en tu ubicación y necesidades específicas
          </p>
        </div>

        {/* Datos del cliente */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Cliente: {usuario.nombre}</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <small className="text-muted">Email:</small><br />
                <span>{usuario.email}</span>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Teléfono:</small><br />
                <span>{usuario.telefono}</span>
              </div>
              <div className="col-12">
                <small className="text-muted">Dirección:</small><br />
                <span>{usuario.direccion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal - placeholder */}
        <div className="card border-dashed" style={{minHeight: '400px'}}>
          <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
            <div className="mb-4" style={{fontSize: '4rem', opacity: 0.3}}>
              🏗️
            </div>
            <h4 className="text-muted mb-3">Aquí va el diseño de la propuesta</h4>
            <p className="text-muted mb-4" style={{maxWidth: '500px'}}>
              Esta sección contendrá la propuesta detallada con cálculos de baterías, 
              opciones de instalación, precios y todos los detalles técnicos 
              personalizados para la ubicación del cliente.
            </p>
            
            {/* Información de desarrollo */}
            <div className="alert alert-info" role="alert">
              <strong>ID de Propuesta:</strong> {validacionData.propuestaId}<br />
              <strong>Zona validada:</strong> ✅ {usuario.ciudad}, {usuario.provincia}
            </div>
          </div>
        </div>

        {/* Acciones futuras */}
        <div className="mt-4 d-flex gap-2 justify-content-center">
          <button className="btn btn-outline-primary" disabled>
            Descargar PDF
          </button>
          <button className="btn btn-outline-success" disabled>
            Solicitar instalación
          </button>
          <button className="btn btn-outline-info" disabled>
            Contactar asesor
          </button>
        </div>
        
        <div className="text-center mt-3">
          <small className="text-muted">
            Funcionalidades próximamente disponibles
          </small>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default Propuesta;

import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';

const ComuneroDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container py-4">
      <div className="bg-white rounded-4 p-4 shadow-lg border w-100 mx-auto" style={{maxWidth: 800}}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <BackButton to="/" />
          <button className="btn btn-outline-danger" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
        
        <div className="text-center mb-4">
          <h1 className="h3 fw-bold">¡Bienvenido, {user?.nombre || 'Comunero'}!</h1>
          <p className="text-muted">Panel de comunero - {user?.email}</p>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">🔋 Calculadora de Baterías</h5>
                <p className="card-text">Calcula la capacidad de batería necesaria para tu instalación solar.</p>
                <button className="btn btn-primary">Acceder</button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">📊 Mis Proyectos</h5>
                <p className="card-text">Revisa y gestiona tus proyectos guardados.</p>
                <button className="btn btn-primary">Ver Proyectos</button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">⚙️ Configuración</h5>
                <p className="card-text">Actualiza tus datos personales y preferencias.</p>
                <button className="btn btn-secondary">Configurar</button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">📞 Soporte</h5>
                <p className="card-text">Contacta con nuestro equipo de soporte técnico.</p>
                <button className="btn btn-secondary">Contactar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComuneroDashboard;

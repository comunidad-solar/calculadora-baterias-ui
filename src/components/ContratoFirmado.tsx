import { useParams } from 'react-router-dom';
import { useFormStore } from '../zustand/formStore';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';

const ContratoFirmado = () => {
  const { propuestaId } = useParams<{ propuestaId: string }>();
  const { form } = useFormStore();

  const descargarContrato = () => {
    // Lógica para descargar el contrato firmado
    console.log('Solicitando descarga de contrato para propuestaId:', propuestaId);
    // En una implementación futura, aquí se haría una llamada al backend para generar/descargar el PDF
  };

  // Usar los datos del store si están disponibles
  const nombreComunero = form.comunero?.nombre || form.nombre || 'Usuario';
  const emailComunero = form.comunero?.email || form.mail || '';
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <PageTransition>
      <div className="min-vh-100 d-flex flex-column">
        <Header />
        
        <div className="flex-grow-1">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                
                {/* Encabezado de éxito */}
                <div className="text-center mb-5">
                  <div className="mb-4">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white"
                      style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                    >
                      ✓
                    </div>
                  </div>
                  <h1 className="display-6 fw-bold text-success mb-3">
                    ¡Bienvenido a Comunidad Solar! 🎉
                  </h1>
                  <p className="lead text-muted">
                    Tu contrato ha sido firmado exitosamente. ¡Ya eres oficialmente parte de nuestra comunidad! 
                    Una copia firmada será enviada a tu correo electrónico.
                  </p>
                </div>

                {/* Información del contrato */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <span className="me-2">📋</span>
                      Información del Contrato
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-muted">ID de Propuesta</label>
                        <p className="mb-0 font-monospace text-break">{propuestaId}</p>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-muted">Fecha de Firma</label>
                        <p className="mb-0">{fechaActual}</p>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-muted">Comunero</label>
                        <p className="mb-0">{nombreComunero}</p>
                      </div>
                      
                      {emailComunero && (
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-muted">Email</label>
                          <p className="mb-0">{emailComunero}</p>
                        </div>
                      )}
                      
                      <div className="col-12">
                        <label className="form-label fw-semibold text-muted">Estado</label>
                        <div>
                          <span className="badge bg-success fs-6">
                            ✅ Firmado Exitosamente
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de confirmación */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <span className="me-2">�</span>
                      Confirmación del Contrato
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-3">
                      <div className="mb-3">
                        <i className="fas fa-envelope-circle-check display-4 text-success"></i>
                      </div>
                      <h6 className="fw-bold mb-2">¡Tu contrato ha sido firmado exitosamente!</h6>
                      <p className="text-muted mb-0">
                        En los próximos minutos recibirás una copia firmada del contrato en tu dirección de email: 
                        <strong className="text-primary">{emailComunero || 'tu email registrado'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Próximos pasos */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <span className="me-2">📋</span>
                      Próximos Pasos
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12">
                        <ul className="list-unstyled">
                          <li className="mb-3">
                            <span className="me-2">📧</span>
                            <strong>Confirmación por email:</strong> En breve recibirás la copia firmada del contrato en tu correo electrónico.
                          </li>
                          <li className="mb-3">
                            <span className="me-2">📞</span>
                            <strong>Contacto personalizado:</strong> Nuestro equipo técnico se pondrá en contacto contigo en las próximas 48 horas para coordinar la instalación.
                          </li>
                          <li className="mb-3">
                            <span className="me-2">🔧</span>
                            <strong>Instalación profesional:</strong> Programaremos la instalación de tu sistema de baterías en una fecha conveniente para ti.
                          </li>
                          <li className="mb-3">
                            <span className="me-2">⚡</span>
                            <strong>Activación y formación:</strong> Una vez completada la instalación, te explicaremos cómo funciona tu nuevo sistema y cómo maximizar tus ahorros.
                          </li>
                          <li>
                            <span className="me-2">🌱</span>
                            <strong>¡Comienza a ahorrar!</strong> Desde el primer día podrás disfrutar de tu energía renovable y ver el impacto positivo en tu factura eléctrica.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                {/* <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <button 
                    className="btn btn-outline-primary btn-lg"
                    onClick={descargarContrato}
                  >
                    <span className="me-2">📄</span>
                    Descargar Contrato
                  </button>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={volverAlInicio}
                  >
                    <span className="me-2">🏠</span>
                    Volver al Inicio
                  </button>
                </div> */}

                {/* Información de contacto */}
                <div className="text-center mt-5">
                  <div className="alert alert-light">
                    <h6 className="mb-2">¿Necesitas ayuda?</h6>
                    <p className="mb-0">
                      Si tienes alguna pregunta sobre tu contrato o el proceso de instalación, 
                      no dudes en <strong>contactarnos</strong> en cualquier momento.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ContratoFirmado;
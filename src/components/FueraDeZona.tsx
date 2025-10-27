import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormStore } from '../zustand/formStore';
import PageTransition from './PageTransition';
import BackButton from './BackButton';

const FueraDeZona = () => {
  const navigate = useNavigate();
  const { form } = useFormStore();

  // Verificar que el usuario realmente sea outZone
  useEffect(() => {
    if (!form.comunero || form.enZona !== 'outZone') {
      // console.log('🔄 Usuario no outZone o sin datos, redirigiendo a inicio');
      navigate('/', { replace: true });
    }
  }, [form.enZona, form.comunero, navigate]);

  const handleVolver = () => {
    // Go back to home instead of resultado to avoid redirect loops
    navigate('/', { replace: true });
  };

  const handleContactarAsesor = () => {
    // Redirigir a la página de contacto con información específica
    navigate('/gracias-contacto', { 
      state: { 
        motivo: 'fuera-zona',
        mensaje: 'Hemos registrado tu solicitud. Un asesor especializado se pondrá en contacto contigo pronto para evaluar las opciones disponibles en tu zona.'
      } 
    });
  };

  if (!form.comunero || form.enZona !== 'outZone') {
    return null;
  }

  return (
    <PageTransition>
      <div className="container py-4">
        <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 700}}>
          
          {/* Back Button */}
          <BackButton to="/" />

          {/* Encabezado principal */}
          <div className="text-center mb-5">
            <div className="bg-warning bg-opacity-10 rounded-3 p-4 mb-4">
              <div className="mb-3">
                <span className="display-1">📍</span>
              </div>
              <h1 className="h3 fw-bold text-warning mb-3">
                Lo sentimos, tu ubicación está fuera de nuestra zona de cobertura actual
              </h1>
              <p className="text-muted mb-0">
                Pero no te preocupes, estamos trabajando para expandir nuestros servicios
              </p>
            </div>
          </div>

          {/* Información del usuario */}
          {form.comunero && (
            <div className="mb-5">
              <div className="bg-light rounded-3 p-4 border">
                <h5 className="fw-bold text-secondary mb-3">
                  <span className="me-2">👤</span>
                  Tu información registrada:
                </h5>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="me-2">📧</span>
                      <div>
                        <small className="text-muted d-block">Email</small>
                        <span className="fw-semibold">{form.comunero.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="me-2">📞</span>
                      <div>
                        <small className="text-muted d-block">Teléfono</small>
                        <span className="fw-semibold">{form.comunero.telefono || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <span className="me-2 mt-1">📍</span>
                      <div>
                        <small className="text-muted d-block">Ubicación</small>
                        <span className="fw-semibold">
                          {form.comunero.direccion || 'No especificada'}
                        </span>
                        {(form.comunero.codigoPostal || form.comunero.ciudad) && (
                          <div className="mt-1">
                            <small className="text-muted">
                              {form.comunero.codigoPostal && `${form.comunero.codigoPostal}`}
                              {form.comunero.ciudad && ` - ${form.comunero.ciudad}`}
                              {form.comunero.provincia && `, ${form.comunero.provincia}`}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Explicación detallada */}
          <div className="mb-5">
            <h4 className="fw-bold text-dark mb-4">¿Qué significa esto?</h4>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="bg-info bg-opacity-10 rounded-3 p-4 h-100">
                  <div className="d-flex align-items-start">
                    <span className="me-3 text-info display-6">🚚</span>
                    <div>
                      <h6 className="fw-bold text-info mb-2">Cobertura de instalación</h6>
                      <p className="small text-muted mb-0">
                        Actualmente nuestro servicio de instalación de baterías tiene cobertura limitada 
                        a ciertas zonas geográficas para garantizar la mejor calidad de servicio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="bg-success bg-opacity-10 rounded-3 p-4 h-100">
                  <div className="d-flex align-items-start">
                    <span className="me-3 text-success display-6">🎯</span>
                    <div>
                      <h6 className="fw-bold text-success mb-2">Expansión continua</h6>
                      <p className="small text-muted mb-0">
                        Estamos expandiendo constantemente nuestras zonas de cobertura. 
                        Tu solicitud nos ayuda a priorizar nuevas áreas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="bg-warning bg-opacity-10 rounded-3 p-4 h-100">
                  <div className="d-flex align-items-start">
                    <span className="me-3 text-warning display-6">👨‍💼</span>
                    <div>
                      <h6 className="fw-bold text-warning mb-2">Asesoría especializada</h6>
                      <p className="small text-muted mb-0">
                        Un asesor evaluará tu caso específico y te informará sobre 
                        opciones alternativas o fechas de disponibilidad futuras.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="bg-primary bg-opacity-10 rounded-3 p-4 h-100">
                  <div className="d-flex align-items-start">
                    <span className="me-3 text-primary display-6">📞</span>
                    <div>
                      <h6 className="fw-bold text-primary mb-2">Contacto prioritario</h6>
                      <p className="small text-muted mb-0">
                        Te contactaremos en cuanto tengamos cobertura en tu zona o 
                        encontremos una solución alternativa para tu proyecto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Siguientes pasos */}
          <div className="mb-5">
            <h4 className="fw-bold text-dark mb-4">¿Qué sigue ahora?</h4>
            
            <div className="bg-light rounded-3 p-4">
              <div className="row g-4 align-items-center">
                <div className="col-md-8">
                  <h5 className="fw-bold text-primary mb-2">
                    <span className="me-2">🚀</span>
                    ¡Solicita contacto con un asesor especializado!
                  </h5>
                  <p className="text-muted mb-0">
                    Nuestro equipo de asesores evaluará tu ubicación, analizará opciones alternativas 
                    y te mantendrá informado sobre la expansión de nuestros servicios a tu zona.
                  </p>
                </div>
                <div className="col-md-4 text-center">
                  <button
                    onClick={handleContactarAsesor}
                    className="btn btn-primary btn-lg w-100"
                  >
                    <span className="me-2">📞</span>
                    Contactar Asesor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mb-4">
            <div className="alert alert-info border-0">
              <div className="d-flex align-items-start">
                <span className="me-2 text-info">💡</span>
                <div>
                  <h6 className="fw-bold text-info mb-1">Información importante</h6>
                  <small className="text-muted">
                    Al solicitar contacto con un asesor, tu información quedará registrada en nuestra base de datos 
                    para futuras expansiones de cobertura. No compartimos tu información con terceros y puedes 
                    darte de baja en cualquier momento.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-3 justify-content-center">
            <button
              onClick={handleVolver}
              className="btn btn-outline-secondary"
            >
              <span className="me-2">←</span>
              Volver atrás
            </button>
            <button
              onClick={handleContactarAsesor}
              className="btn btn-primary"
            >
              <span className="me-2">📞</span>
              Solicitar contacto
            </button>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default FueraDeZona;
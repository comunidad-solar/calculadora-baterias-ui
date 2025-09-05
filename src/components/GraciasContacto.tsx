import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageTransition from './PageTransition';

const GraciasContacto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  // Extraer datos del estado de navegación
  const { mensaje } = location.state || {
    mensaje: 'Hemos recibido tu solicitud correctamente. Un especialista se pondrá en contacto contigo muy pronto.'
  };

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleVolverInicio = () => {
    navigate('/');
  };

  const handleContactarWhatsApp = () => {
    // Número de WhatsApp de ejemplo - ajustar según necesidades
    const phoneNumber = '34611195869';
    const message = encodeURIComponent('Hola, he completado el formulario de baterías y me gustaría obtener más información sobre mi propuesta personalizada.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <PageTransition>
      <div className="container py-5">
        <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 700}}>
          
          {/* Icono de éxito animado */}
          <div className={`text-center mb-4 transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4 success-icon" 
                 style={{width: '100px', height: '100px'}}>
              <span style={{fontSize: '3.5rem'}} className="text-success">✓</span>
            </div>
          </div>

          {/* Título principal */}
          <div className={`text-center mb-4 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="h2 fw-bold text-primary mb-3">
              ¡Gracias por tu solicitud!
            </h1>
            <h2 className="h4 text-secondary mb-4">
              Tu consulta ha sido registrada exitosamente
            </h2>
          </div>

          {/* Mensaje personalizado */}
          <div className={`mb-5 transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-primary bg-opacity-5 rounded-4 p-4 border border-primary border-opacity-20">
              <div className="d-flex align-items-start">
                <span className="me-3 mt-1" style={{fontSize: '1.5rem'}}>💡</span>
                <div>
                  <p className="mb-0 text-dark" style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                    {mensaje}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className={`mb-5 transition-all duration-700 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <span className="me-3" style={{fontSize: '1.5rem'}}>⏰</span>
                  <div>
                    <h5 className="mb-1 fw-semibold text-primary">Tiempo de respuesta</h5>
                    <p className="mb-0 text-muted">24-48 horas laborables</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <span className="me-3" style={{fontSize: '1.5rem'}}>📞</span>
                  <div>
                    <h5 className="mb-1 fw-semibold text-primary">Contacto directo</h5>
                    <p className="mb-0 text-muted">Especialista asignado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos pasos */}
          <div className={`mb-5 transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h4 className="fw-bold text-dark mb-4 text-center">¿Qué sigue ahora?</h4>
            <div className="row g-4">
              <div className="col-12">
                <div className="d-flex align-items-start p-3 rounded-3 bg-light border">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                       style={{width: '32px', height: '32px'}}>
                    <span className="text-white fw-bold" style={{fontSize: '0.9rem'}}>1</span>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1">Análisis personalizado</h6>
                    <p className="mb-0 text-muted small">Nuestro equipo técnico revisará tu caso específico y preparará una propuesta adaptada a tus necesidades.</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-start p-3 rounded-3 bg-light border">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                       style={{width: '32px', height: '32px'}}>
                    <span className="text-white fw-bold" style={{fontSize: '0.9rem'}}>2</span>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1">Contacto personalizado</h6>
                    <p className="mb-0 text-muted small">Te contactaremos por teléfono o email para presentarte tu propuesta y resolver todas tus dudas.</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-start p-3 rounded-3 bg-light border">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                       style={{width: '32px', height: '32px'}}>
                    <span className="text-white fw-bold" style={{fontSize: '0.9rem'}}>3</span>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1">Propuesta detallada</h6>
                    <p className="mb-0 text-muted small">Recibirás una propuesta completa con precios, productos recomendados y plan de instalación.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className={`d-grid gap-3 transition-all duration-700 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="row g-3">
              <div className="col-md-6">
                <button
                  onClick={handleContactarWhatsApp}
                  className="btn btn-success btn-lg w-100 fw-semibold button-hover-effect"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    border: 'none'
                  }}
                >
                  <span className="me-2">💬</span>
                  Contactar por WhatsApp
                </button>
              </div>
              <div className="col-md-6">
                <button
                  onClick={handleVolverInicio}
                  className="btn btn-outline-primary btn-lg w-100 fw-semibold button-hover-effect"
                >
                  <span className="me-2">🏠</span>
                  Volver al inicio
                </button>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <small className="text-muted">
                Si tienes alguna pregunta urgente, no dudes en contactarnos directamente.
              </small>
            </div>
          </div>

          {/* Estilos CSS */}
          <style>{`
            .success-icon {
              animation: pulseSuccess 2s ease-in-out infinite;
            }
            
            @keyframes pulseSuccess {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.4);
              }
              50% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
              }
            }
            
            .button-hover-effect {
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            
            .button-hover-effect:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            
            .button-hover-effect:active {
              transform: translateY(0);
            }
            
            .transition-all {
              transition-property: all;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .duration-500 {
              transition-duration: 500ms;
            }
            
            .duration-700 {
              transition-duration: 700ms;
            }
            
            .delay-200 {
              transition-delay: 200ms;
            }
            
            .delay-400 {
              transition-delay: 400ms;
            }
            
            .delay-600 {
              transition-delay: 600ms;
            }
            
            .delay-700 {
              transition-delay: 700ms;
            }
            
            .delay-900 {
              transition-delay: 900ms;
            }
            
            .scale-75 {
              transform: scale(0.75);
            }
            
            .scale-100 {
              transform: scale(1);
            }
            
            .translate-y-0 {
              transform: translateY(0);
            }
            
            .translate-y-4 {
              transform: translateY(1rem);
            }
            
            .opacity-0 {
              opacity: 0;
            }
            
            .opacity-100 {
              opacity: 1;
            }
          `}</style>
        </div>
      </div>
    </PageTransition>
  );
};

export default GraciasContacto;

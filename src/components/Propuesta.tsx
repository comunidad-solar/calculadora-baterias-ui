import { useUsuario } from '../context/UsuarioContext';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
import logoCS from '../assets/logocircularcs.png';
import bateriaEcoflow from '../assets/bateriaEcoflow1.png';

const Propuesta = () => {
  const { validacionData, usuario } = useUsuario();
  const navigate = useNavigate();

  if (!validacionData || !usuario || validacionData.enZona !== "inZone") {
    navigate('/');
    return null;
  }

  return (
    <PageTransition>
      <div 
        className="min-vh-100 py-4" 
        style={{ backgroundColor: '#FAFAF5' }}
      >
        <div className="container-fluid" style={{ maxWidth: '1200px' }}>
          
          {/* Botón volver en la esquina superior izquierda */}
          <div className="position-relative mb-3">
            <BackButton />
          </div>

          {/* Header con saludo personalizado */}
          <div 
            className="gradient-border shadow-sm position-relative"
            style={{
              borderRadius: '20px'
            }}
          >
            <div className="bg-white p-3 rounded-4">
              <div className="d-flex align-items-center gap-3">
                <div className="flex-shrink-0">
                  <img 
                    src={logoCS} 
                    alt="Comunidad Solar" 
                    style={{ width: '100px', height: '100px' }}
                  />
                  {/* Fallback logo */}
                  <div 
                    className="bg-primary bg-opacity-10 rounded-circle d-none align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <span style={{fontSize: '1.5rem'}}>🏠</span>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1 fw-bold">Hola, {usuario.nombre}</h4>
                  <p className="mb-0 text-secondary">
                    Aquí tienes la propuesta de baterías que mejor se adapta a tu ubicación y necesidades específicas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Pack Batería */}
          <div className="mt-5">
            <div className="row g-0">
              <div className="col-lg-6">
                {/* Título FUERA de la card */}
                <h1 
                  className="fw-bold mb-4 mt-5" 
                  style={{
                    background: 'linear-gradient(90deg, #79BC1C, #B0D83E)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '2.5rem',
                    lineHeight: '1.2'
                  }}
                >
                  Pack Batería Monofásico<br />
                  EcoFlow 5 kWh con Inversor de 12 kW
                </h1>
                
                {/* Card con precio y botón */}
                <div className="bg-white rounded-4 shadow-lg p-4 position-relative text-center">
                  {/* Sección precio */}
                  <div className="mb-4">
                    <p 
                      className="mb-2 fw-medium" 
                      style={{ color: '#6FAF32', fontSize: '1.3rem' }}
                    >
                      Tu mejor Pack de Batería solo por
                    </p>
                    <div className="d-flex align-items-baseline justify-content-center gap-2 mb-3">
                      <span 
                        className="fw-bold" 
                        style={{ 
                          color: '#6FAF32', 
                          fontSize: '4rem',
                          lineHeight: '1'
                        }}
                      >
                        4.699€
                      </span>
                      <span 
                        style={{ 
                          color: '#6FAF32', 
                          fontSize: '1.2rem',
                          opacity: 0.8
                        }}
                      >
                        (IVA incluido)
                      </span>
                    </div>
                    <p 
                      className="mb-0" 
                      style={{ 
                        color: '#6FAF32', 
                        fontSize: '1.2rem'
                      }}
                    >
                      Incluye sistema de respaldo<br />
                      + Instalación profesional
                    </p>
                  </div>
                  
                  {/* Botón COMPRAR en el borde inferior de la card */}
                  <div className="text-center mt-4 mb-2">
                    <button 
                      className="btn btn-lg px-5 py-3 fw-bold text-white border-0 comprar-btn"
                      style={{
                        background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                        borderRadius: '100px',
                        fontSize: '1.2rem',
                        minWidth: '200px'
                      }}
                    >
                      COMPRAR
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Imagen de la batería */}
              <div className="col-lg-6">
                <div className="h-100 d-flex align-items-center justify-content-center p-4">
                  <img 
                    src={bateriaEcoflow} 
                    alt="Batería EcoFlow" 
                    className="img-fluid rounded-4"
                    style={{ 
                      maxHeight: '100%',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Botones adicionales */}
          <div className="mt-4 d-flex justify-content-end align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#79BC1C' }}>ℹ️</span>
                <span style={{ color: '#79BC1C' }}>¿Tienes dudas?</span>
              </div>
              <button 
                className="btn px-4 py-2 gradient-border-btn"
                style={{
                  background: 'white',
                  color: '#79BC1C',
                  borderRadius: '100px',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box'
                }}
              >
                CONTACTA CON UN ASESOR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos específicos para el borde gradient */}
      <style>{`
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
        
        /* Borde gradient personalizado con esquinas redondeadas */
        .gradient-border {
          position: relative;
          background: linear-gradient(90deg, #79BC1C, #FFAD2A, #4BCCE2);
          border-radius: 20px;
          padding: 3px;
        }
        
        .gradient-border .bg-white {
          border-radius: 17px; /* Ligeramente menor para que se vea el borde */
        }
        
        /* Botón COMPRAR con efecto hover */
        .comprar-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(92, 160, 14, 0.3);
          transition: all 0.3s ease;
        }
        
        /* Botón con borde gradiente */
        .gradient-border-btn {
          position: relative;
          background: white;
          border: none !important;
        }
        
        .gradient-border-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(90deg, #79BC1C, #FFB900, #4BCCE2);
          border-radius: 100px;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
        }
        
        .gradient-border-btn:hover::before {
          background: linear-gradient(90deg, #79BC1C, #FFB900, #4BCCE2);
        }
        
        /* Soporte para gradients de texto en navegadores */
        @supports (-webkit-background-clip: text) {
          .gradient-text {
            background: linear-gradient(90deg, #79BC1C, #B0D83E);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
      `}</style>
    </PageTransition>
  );
};

export default Propuesta;

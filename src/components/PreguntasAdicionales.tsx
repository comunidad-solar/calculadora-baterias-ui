import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from './PageTransition';

const PreguntasAdicionales = () => {
  const [tieneInstalacionFV, setTieneInstalacionFV] = useState<boolean | null>(null);
  const [tipoInversor, setTipoInversor] = useState<string>('');
  const [tipoInstalacion, setTipoInstalacion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (tieneInstalacionFV === null) {
      showToast('Por favor indica si tienes instalación fotovoltaica', 'error');
      setLoading(false);
      return;
    }

    if (tieneInstalacionFV && !tipoInversor) {
      showToast('Por favor selecciona el tipo de inversor', 'error');
      setLoading(false);
      return;
    }

    if (!tieneInstalacionFV && !tipoInstalacion) {
      showToast('Por favor selecciona el tipo de instalación', 'error');
      setLoading(false);
      return;
    }

    try {
      // Simular envío de datos adicionales al backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos a guardar/enviar
      const datosAdicionales = {
        tieneInstalacionFV,
        ...(tieneInstalacionFV ? { tipoInversor } : { tipoInstalacion })
      };

      console.log('Datos adicionales:', datosAdicionales);
      
      showToast('¡Información guardada correctamente!', 'success');
      
      // Redirigir a la página de propuesta o dashboard
      navigate('/propuesta');
      
    } catch (error) {
      showToast('Error al guardar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="container py-4">
        <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 600}}>
          
          {/* Banner principal */}
          <div className="text-center mb-5">
            <div className="bg-primary bg-opacity-10 rounded-3 p-4 mb-4">
              <h1 className="h3 fw-bold text-primary mb-3">
                PARA PODER OFRECERTE UNA PROPUESTA PERSONALIZADA
              </h1>
              <p className="h5 text-secondary mb-0">
                NECESITAMOS QUE CONTESTES A LAS SIGUIENTES PREGUNTAS
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="d-grid gap-4">
            
            {/* Pregunta 1: ¿Tienes instalación fotovoltaica? */}
            <div>
              <label className="form-label h5 fw-bold mb-3">
                ¿Tienes instalación fotovoltaica instalada? <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="instalacionFV"
                    id="instalacionSi"
                    checked={tieneInstalacionFV === true}
                    onChange={() => {
                      setTieneInstalacionFV(true);
                      setTipoInstalacion(''); // Reset tipo instalación
                    }}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="instalacionSi">
                    Sí
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="instalacionFV"
                    id="instalacionNo"
                    checked={tieneInstalacionFV === false}
                    onChange={() => {
                      setTieneInstalacionFV(false);
                      setTipoInversor(''); // Reset tipo inversor
                    }}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="instalacionNo">
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Si tiene instalación FV - Tipo de inversor */}
            {tieneInstalacionFV === true && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  Tipo de inversor <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={tipoInversor}
                  onChange={(e) => setTipoInversor(e.target.value)}
                  required
                >
                  <option value="">Selecciona el tipo de inversor</option>
                  <option value="trifasica">Trifásica</option>
                  <option value="monofasica">Monofásica</option>
                  <option value="desconozco">Lo desconozco</option>
                </select>
              </div>
            )}

            {/* Si NO tiene instalación FV - Tipo de instalación */}
            {tieneInstalacionFV === false && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  Tipo de instalación <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={tipoInstalacion}
                  onChange={(e) => setTipoInstalacion(e.target.value)}
                  required
                >
                  <option value="">Selecciona el tipo de instalación</option>
                  <option value="trifasica">Trifásica</option>
                  <option value="monofasica">Monofásica</option>
                  <option value="desconozco">Lo desconozco</option>
                </select>
              </div>
            )}

            {/* Botón enviar */}
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg fw-bold button-hover-result"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                  border: 'none'
                }}
              >
                {loading ? 'Guardando...' : 'Continuar con mi propuesta'}
              </button>
              <small className="text-muted text-center">
                Esta información nos ayudará a crear una propuesta personalizada para ti
              </small>
            </div>
          </form>

          {/* Estilos CSS */}
          <style>{`
            .fade-in-result {
              opacity: 1;
              transform: translateY(0);
              transition: all 0.3s ease-out;
            }
            
            .button-hover-result {
              transition: all 0.2s ease-out;
            }
            
            .button-hover-result:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }
            
            .form-check-input:checked {
              background-color: #0d6efd;
              border-color: #0d6efd;
            }
            
            .form-select-lg {
              font-size: 1.1rem;
              padding: 0.75rem;
            }
          `}</style>
        </div>
      </div>
    </PageTransition>
  );
};

export default PreguntasAdicionales;

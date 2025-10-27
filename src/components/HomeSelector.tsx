import { useState } from 'react';
import { useAsesores } from '../hooks/useAsesores';
import { useFormStore } from '../zustand/formStore';
import { useNavigate } from 'react-router-dom';
import { bateriaService } from '../services/apiService';
import { useToast } from '../context/ToastContext';



interface HomeSelectorProps {
  onSelect: (isComunero: boolean) => void;
}

const HomeSelector: React.FC<HomeSelectorProps> = ({ onSelect }) => {
  const { isAsesores } = useAsesores();
  const { setField, setValidacionData, setRespuestasPreguntas } = useFormStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dealId, setDealId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidDealId, setIsValidDealId] = useState(false);
  
  // Validar formato del Deal ID
  const validateDealId = (id: string) => {
    const cleanId = id.trim();
    const isValid = cleanId.length === 18 && cleanId.startsWith('230641');
    setIsValidDealId(isValid);
    return isValid;
  };
  
  // Manejar cambios en el input con validación
  const handleDealIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDealId(value);
    validateDealId(value);
  };
  const handleDealIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealId.trim() || isProcessing || !isValidDealId) {
      if (!isValidDealId) {
        showToast('El Deal ID debe tener 18 dígitos y comenzar con 230641', 'error');
      }
      return;
    }

    setIsProcessing(true);
    try {
      // console.log('📡 Iniciando búsqueda de deal:', dealId.trim());
      
      // Guardar el dealId en el store
      setField('dealId', dealId.trim());
      
      // Hacer la solicitud al backend
      const response = await bateriaService.obtenerDealPorId(dealId.trim());
      
      if (response.success && response.data?.data) {
        // console.log('✅ Deal procesado exitosamente:', response.data.data);
        
        // Actualizar el store con todos los datos del deal
        setValidacionData({
          token: response.data.data.token,
          comunero: response.data.data.comunero,
          enZona: response.data.data.enZona,
          motivo: response.data.data.motivo || '',
          propuestaId: response.data.data.propuestaId,
          analisisTratos: response.data.data.analisisTratos,
          dealId: response.data.data.dealId,
          mpkLogId: response.data.mpk_log_id // Guardar el mpk_log_id que viene en la respuesta
        });
        
        // Si hay respuestas de preguntas, cargarlas también
        if (response.data.data.respuestasPreguntas) {
          setRespuestasPreguntas(response.data.data.respuestasPreguntas);
        }
        
        // Marcar que venimos de un deal de asesores
        setField('fromAsesoresDeal', true);
        setField('asesores', true);
        
        showToast('Deal cargado exitosamente', 'success');
        
        // Navegar a preguntas adicionales con los datos ya cargados
        navigate('/preguntas-adicionales');
      } else {
        throw new Error('No se pudo cargar la información del deal');
      }
    } catch (error) {
      console.error('❌ Error procesando deal:', error);
      showToast('Error al cargar el deal. Verifica el ID e inténtalo de nuevo.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-4 px-4 py-5 shadow-lg border w-100 mx-auto">
      {/* <h1 className="h3 text-center mb-3" style={{fontWeight: '600'}}>
        Calculadora de ahorro y número<br />de paneles solares
      </h1> */}
      
      {isAsesores ? (
        // Modo asesores: formulario AI-powered para dealId
        <div className="position-relative">
          {/* Fondo con gradiente y efectos AI */}
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{
            background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.05) 0%, rgba(102, 16, 242, 0.05) 100%)',
            borderRadius: '1rem',
            zIndex: 0
          }}></div>
          
          {/* Partículas flotantes decorativas */}
          <div className="position-absolute" style={{
            top: '10px', right: '20px', width: '6px', height: '6px',
            background: 'linear-gradient(45deg, #0d6efd, #6610f2)',
            borderRadius: '50%', animation: 'float 3s ease-in-out infinite', zIndex: 1
          }}></div>
          <div className="position-absolute" style={{
            top: '40px', left: '15px', width: '4px', height: '4px',
            background: 'linear-gradient(45deg, #6610f2, #0d6efd)',
            borderRadius: '50%', animation: 'float 4s ease-in-out infinite reverse', zIndex: 1
          }}></div>
          <div className="position-absolute" style={{
            bottom: '30px', right: '40px', width: '5px', height: '5px',
            background: 'linear-gradient(45deg, #0d6efd, #6610f2)',
            borderRadius: '50%', animation: 'float 3.5s ease-in-out infinite', zIndex: 1
          }}></div>

          <div className="text-center position-relative" style={{ zIndex: 2 }}>
            {/* Header con efecto AI */}
            <div className="mb-5">
              <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
                borderRadius: '50%',
                boxShadow: '0 10px 30px rgba(13, 110, 253, 0.3)'
              }}>
                <i className="fas fa-robot text-white" style={{ fontSize: '2rem' }}></i>
              </div>
              
              <h2 className="h3 fw-bold mb-2" style={{
                background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Ingresa el ID del deal
              </h2>
              {/* <p className="text-muted mb-0 px-3">
                Analiza instantáneamente tu deal con inteligencia artificial avanzada
              </p> */}
            </div>
            
            <form onSubmit={handleDealIdSubmit} className="position-relative">
              {/* Input container con efectos futuristas */}
              <div className="mb-4 position-relative">
                <div className="position-relative" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: `2px solid ${isValidDealId ? '#198754' : dealId ? '#dc3545' : 'rgba(13, 110, 253, 0.2)'}`,
                  boxShadow: isValidDealId 
                    ? '0 0 20px rgba(25, 135, 84, 0.3)' 
                    : dealId && !isValidDealId 
                      ? '0 0 20px rgba(220, 53, 69, 0.3)'
                      : '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}>
                  
                  {/* Indicador de estado AI */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <label htmlFor="dealId" className="form-label fw-bold text-dark mb-0">
                      <i className="fas fa-microchip me-2 text-primary"></i>
                      Deal ID
                    </label>
                    <div className={`badge ${isValidDealId ? 'bg-success' : dealId ? 'bg-danger' : 'bg-secondary'} px-3 py-2 rounded-pill`}>
                      <i className={`fas ${isValidDealId ? 'fa-check-circle' : dealId ? 'fa-exclamation-triangle' : 'fa-scan'} me-1`}></i>
                      {isValidDealId ? 'Válido' : dealId ? 'Inválido' : 'Por ingresar'}
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    id="dealId"
                    className={`form-control form-control-lg text-center fw-bold border-0 ${
                      isValidDealId ? 'is-valid' : dealId && !isValidDealId ? 'is-invalid' : ''
                    }`}
                    placeholder="230641000167804731"
                    value={dealId}
                    onChange={handleDealIdChange}
                    disabled={isProcessing}
                    required
                    style={{
                      background: 'transparent',
                      fontSize: '1.2rem',
                      letterSpacing: '0.05em',
                      boxShadow: 'none'
                    }}
                  />
                  
                  {/* Indicadores de validación */}
                  {/* <div className="mt-2">
                    <small className="text-muted d-block mb-1">
                      Formato: 18 dígitos • Prefijo: 230641
                    </small>
                    <div className="d-flex justify-content-center gap-2">
                      <span className={`badge ${dealId.length === 18 ? 'bg-success' : 'bg-light text-dark'} rounded-pill`}>
                        <i className={`fas ${dealId.length === 18 ? 'fa-check' : 'fa-hash'} me-1`}></i>
                        18 dígitos
                      </span>
                      <span className={`badge ${dealId.startsWith('230641') ? 'bg-success' : 'bg-light text-dark'} rounded-pill`}>
                        <i className={`fas ${dealId.startsWith('230641') ? 'fa-check' : 'fa-key'} me-1`}></i>
                        Prefijo 230641
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>
              
              {/* Botón AI con efectos */}
              <button
                type="submit"
                className="btn btn-lg fw-bold px-5 py-3 rounded-pill position-relative overflow-hidden"
                disabled={!isValidDealId || isProcessing}
                style={{
                  background: isValidDealId 
                    ? 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)' 
                    : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                  border: 'none',
                  boxShadow: isValidDealId 
                    ? '0 10px 30px rgba(13, 110, 253, 0.4)' 
                    : '0 5px 15px rgba(108, 117, 125, 0.3)',
                  transform: isProcessing ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  color: 'white',
                  minWidth: '200px'
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="spinner-grow spinner-grow-sm me-2" role="status" style={{ width: '1rem', height: '1rem' }}>
                        <span className="visually-hidden">Analizando...</span>
                      </div>
                      <span>Analizando...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <i className="fas fa-brain me-2"></i>
                    Analizar Deal
                  </>
                )}
                
                {/* Efecto de brillo */}
                {!isProcessing && isValidDealId && (
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                    animation: 'shimmer 2s infinite'
                  }}></div>
                )}
              </button>
            </form>
          </div>

          {/* CSS para animaciones */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}</style>
        </div>
      ) : (
        // Modo normal: mostrar botones comunero/no comunero
        <div className="d-flex justify-content-center gap-3">
          <button
            className="btn btn-dark btn-lg fw-bold px-4 rounded-pill"
            onClick={() => onSelect(true)}
          >
            Soy Comunero
          </button>
          <button
            className="btn btn-outline-dark btn-lg fw-bold px-4 rounded-pill"
            onClick={() => onSelect(false)}
          >
            No soy Comunero
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeSelector;

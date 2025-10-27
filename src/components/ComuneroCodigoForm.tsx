import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import BackButton from './BackButton';
import CodeInput from './CodeInput';
import PageTransition from './PageTransition';
import { comuneroService } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { useFormStore } from '../zustand/formStore';

const ComuneroCodigoForm = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [showNoContactModal, setShowNoContactModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const fromCompra = location.state?.fromCompra;
  const propuestaIdFromState = location.state?.propuestaId;
  const { showToast } = useToast();
  const { setValidacionData, form } = useFormStore();

  // Usar propuestaId del store si está disponible, sino usar la del state
  const propuestaId = form.propuestaId || propuestaIdFromState;

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Initialize cooldown on component mount (first email sent)
  useEffect(() => {
    if (!lastResendTime) {
      const now = Date.now();
      setLastResendTime(now);
      setResendCooldown(300); // 5 minutos = 300 segundos
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (fromCompra && propuestaId) {
        // Flujo de compra/contratación: usar endpoint de contratación
        // console.log('🛒 Validando código para contratación con propuestaId:', propuestaId);
        response = await comuneroService.validarCodigoContratacion(codigo, propuestaId);
        
        // Para flujo de contratación, esperamos solo {codigoValido: true}
        if (response.success && response.data?.codigoValido === true) {
          // console.log('✅ Código válido para contratación, redirigiendo a firma de contrato');
          showToast('¡Código validado correctamente!', 'success');
          
          // Redirigir directamente a firma de contrato
          navigate('/contratacion/firma-contrato', {
            state: { 
              propuestaId: propuestaId,
              fromValidacion: true
            }
          });
          return;
        } else {
          throw new Error('Código de verificación incorrecto para contratación');
        }
      } else {
        // Flujo normal de comunero: usar endpoint estándar
        // console.log('🔍 Validando código estándar con email:', email);
        response = await comuneroService.validarCodigo(codigo, email);
        // Verificar si es el caso específico de contacto no encontrado
        if (!response.success && (response as any).data?.contactoEncontrado === false) {
          // console.log('🚫 Contacto no encontrado en el sistema, mostrando modal de opciones');
          setShowNoContactModal(true);
          return;
        }
        if (response.success && (response as any).data?.contactoEncontrado === false) {
          // console.log('🚫 Contacto no encontrado en el sistema, mostrando modal de opciones');
          setShowNoContactModal(true);
          return;
        }
        
        // Para flujo normal, esperamos estructura completa
        if (response.success && response.data) {
          // console.log('✅ Código validado para flujo normal');
          showToast('¡Código validado correctamente!', 'success');
          
          // Log específico para analisisTratos
          if (response.data?.analisisTratos) {
            // console.log('📊 Análisis de tratos:', response.data.analisisTratos);
          }
          
          // console.log('🔍 Estado de enZona:', response.data?.enZona);
          
          // Guardar datos de validación en el contexto
          const validacionData = {
            token: response.data.token,
            comunero: response.data.comunero,
            enZona: response.data.enZona,
            motivo: response.data.motivo,
            propuestaId: response.data.propuestaId,
            analisisTratos: response.data.analisisTratos
          };
          
          // console.log('💾 Guardando validacionData:', validacionData);
          setValidacionData(validacionData);
          
          // Redirigir según el estado de la zona
          if (response.data.enZona === "inZone" || response.data.enZona === "inZoneWithCost" || response.data.enZona === "NoCPAvailable") {
            // Limpiar flags previos y establecer nuevo flag de validación
            sessionStorage.removeItem('datosActualizadosObtenidos');
            sessionStorage.setItem('fromValidarCodigo', 'true');
            navigate('/preguntas-adicionales', {
              state: { 
                fromValidarCodigo: true,
                validacionData: validacionData // Backup en state
              }
            });
          } else if (response.data.enZona === "outZone") {
            navigate('/resultado', { 
              state: { 
                fueraDeZona: true, 
                motivo: response.data.motivo,
                validacionData: validacionData // Backup en state
              } 
            });
          } else {
            navigate('/resultado');
          }
          return;
        } else {
          throw new Error('Código incorrecto. Inténtalo de nuevo.');
        }
      }
    } catch (err: any) {
      console.error('❌ Error inesperado en validación de código:', err);
      const errorMsg = 'Error inesperado. Por favor, inténtalo de nuevo.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    
    setResendLoading(true);
    try {
      const response = await comuneroService.validarEmail(email);
      if (response.success) {
        showToast('Código reenviado correctamente', 'success');
        setCodigo(''); // Limpiar el código anterior
        
        // Activar cooldown de 5 minutos
        const now = Date.now();
        setLastResendTime(now);
        setResendCooldown(300); // 5 minutos = 300 segundos
      } else {
        showToast('Error al reenviar el código', 'error');
      }
    } catch (err) {
      showToast('Error al reenviar el código', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const handleIntentarOtroEmail = () => {
    setShowNoContactModal(false);
    navigate('/comunero', { replace: true });
  };

  const handleContinuarComoNoSoyComunero = () => {
    setShowNoContactModal(false);
    navigate('/nuevo-comunero', { replace: true });
  };

  const handleCerrarModal = () => {
    setShowNoContactModal(false);
  };

  return (
    <PageTransition>
      <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 450}}>
      <BackButton />
      <div className="text-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
          <span style={{fontSize: '24px'}}>📧</span>
        </div>
        <h2 className="h4 fw-bold mb-2">
          {fromCompra ? 'Confirma tu compra' : 'Introduce el código de validación'}
        </h2>
        <p className="text-muted mb-0">
          {fromCompra 
            ? 'Para proceder con la compra, introduce el código de 6 dígitos que hemos enviado a tu correo electrónico'
            : 'Hemos enviado un código de 6 dígitos a tu correo electrónico'
          }
        </p>
      </div>
      <form className="d-grid gap-4" onSubmit={handleSubmit}>
        <div>
          <CodeInput 
            length={6} 
            value={codigo} 
            onChange={setCodigo} 
            disabled={loading}
          />
        </div>
        {error && <div className="text-danger text-center mb-2">{error}</div>}
        <button 
          type="submit" 
          className="btn btn-dark btn-lg w-100 fw-bold" 
          disabled={loading || codigo.length !== 6}
        >
          {loading 
            ? (fromCompra ? 'Procesando compra...' : 'Validando...') 
            : (fromCompra ? 'Confirmar compra' : 'Validar código')
          }
        </button>
        
        <div className="text-center">
          <span className="text-muted">¿No recibiste el código? </span>
          {resendCooldown > 0 ? (
            <div className="mt-2">
              <div className="text-muted small">
                Reenviar de nuevo en: <span className="fw-bold text-primary">{formatTime(resendCooldown)}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-link p-0 fw-semibold"
              onClick={handleResend}
              disabled={resendLoading}
              style={{textDecoration: 'none'}}
            >
              {resendLoading ? 'Reenviando...' : 'Reenviar'}
            </button>
          )}
        </div>
      </form>
      </div>

      {/* Modal para contacto no encontrado */}
      {showNoContactModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '20px'
          }}
          onClick={handleCerrarModal}
        >
          <div 
            className="bg-white border-0 shadow-lg" 
            style={{
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-4" style={{background: 'linear-gradient(135deg, #dc3545, #c82333)', borderRadius: '20px 20px 0 0'}}>
              <h4 className="text-white fw-bold mb-0">
                <span className="me-2">❌</span>
                Comunero no encontrado
              </h4>
              <p className="text-white-50 mb-0 small mt-2">
                No pudimos encontrar tu información en nuestro sistema
              </p>
            </div>
            
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <span className="display-1 mb-0">🔍</span>
                </div>
                <h5 className="fw-bold text-dark mb-2">
                  No encontramos ningún comunero con el correo:
                </h5>
                <div className="bg-light rounded-2 p-2 mb-3">
                  <span className="fw-semibold text-primary">{email}</span>
                </div>
                <p className="text-muted mb-0">
                  Esto puede suceder si el correo no está registrado en nuestro sistema 
                  o si hay algún error tipográfico.
                </p>
              </div>

              <div className="alert alert-info border-0 mb-4">
                <div className="d-flex align-items-start">
                  <span className="me-2">💡</span>
                  <div>
                    <small>
                      <strong>¿Qué puedes hacer?</strong><br/>
                      Verifica que el correo sea correcto o continúa como usuario nuevo si no tienes cuenta previa.
                    </small>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleIntentarOtroEmail}
                >
                  <span className="me-2">📧</span>
                  Intentar con otro correo
                </button>
                
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleContinuarComoNoSoyComunero}
                >
                  <span className="me-2">👤</span>
                  Continuar como "No soy comunero"
                </button>
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleCerrarModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
};

export default ComuneroCodigoForm;

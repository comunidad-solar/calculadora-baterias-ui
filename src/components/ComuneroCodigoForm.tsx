import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const { showToast } = useToast();
  const { setValidacionData } = useFormStore();

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
      const response = await comuneroService.validarCodigo(codigo, email);
      
      console.log('🌐 Response from validarCodigo:', response);
      if (response.success) {
        // Log específico para analisisTratos
        if (response.data?.analisisTratos) {
          console.log('📊 Análisis de tratos:', response.data.analisisTratos);
        }
        
        console.log('🔍 Estado de enZona:', response.data?.enZona);
        
        showToast('¡Código validado correctamente!', 'success');
        // Guardar los datos de validación en el contexto
        if (response.data) {
          // Asegurarnos de que tiene la estructura correcta
          const validacionData = {
            token: response.data.token,
            comunero: response.data.comunero,
            enZona: response.data.enZona,
            motivo: response.data.motivo,
            propuestaId: response.data.propuestaId, // Temporalmente comentado por error de TypeScript
            analisisTratos: response.data.analisisTratos
          };
          
          console.log('💾 Guardando validacionData:', validacionData);
          setValidacionData(validacionData);
          
          // Verificar el estado de la zona para redirigir correctamente
          if (response.data.enZona === "inZone" || response.data.enZona === "inZoneWithCost") {
            // Marcar que viene del flujo de validar-codigo para buscar datos actualizados
            sessionStorage.setItem('fromValidarCodigo', 'true');
            
            // En zona (con o sin costo): ir a preguntas adicionales
            navigate('/preguntas-adicionales', {
              state: { fromValidarCodigo: true }
            });
          } else if (response.data.enZona === "outZone") {
            // Fuera de zona: ir a página de resultado con mensaje de fuera de zona
            navigate('/resultado', { 
              state: { 
                fueraDeZona: true, 
                motivo: response.data.motivo 
              } 
            });
          }
        } else {
          // Fallback si no hay data
          navigate('/resultado');
        }
      } else {
        const errorMsg = response.error || 'Código incorrecto. Inténtalo de nuevo.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      const errorMsg = 'No se pudo conectar con el servidor. Comprueba tu conexión a internet.';
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

  return (
    <PageTransition>
      <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 450}}>
      <BackButton />
      <div className="text-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
          <span style={{fontSize: '24px'}}>📧</span>
        </div>
        <h2 className="h4 fw-bold mb-2">Introduce el código de validación</h2>
        <p className="text-muted mb-0">
          Hemos enviado un código de 6 dígitos a tu correo electrónico
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
          {loading ? 'Validando...' : 'Validar código'}
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
    </PageTransition>
  );
};

export default ComuneroCodigoForm;

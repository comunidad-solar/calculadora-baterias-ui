import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import CodeInput from './CodeInput';
import PageTransition from './PageTransition';
import { comuneroService } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { useUsuario } from '../context/UsuarioContext';

const ComuneroCodigoForm = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const { showToast } = useToast();
  const { setValidacionData } = useUsuario();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await comuneroService.validarCodigo(codigo, email);
      
      if (response.success) {
        showToast('¡Código validado correctamente!', 'success');
        // Guardar los datos de validación en el contexto
        if (response.data) {
          // setValidacionData(response.data);
        }
        // Redirigir al resultado
        navigate('/resultado');
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
    if (!email) return;
    
    setResendLoading(true);
    try {
      const response = await comuneroService.validarEmail(email);
      if (response.success) {
        showToast('Código reenviado correctamente', 'success');
        setCodigo(''); // Limpiar el código anterior
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
          <button
            type="button"
            className="btn btn-link p-0 fw-semibold"
            onClick={handleResend}
            disabled={resendLoading}
            style={{textDecoration: 'none'}}
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar'}
          </button>
        </div>
      </form>
      </div>
    </PageTransition>
  );
};

export default ComuneroCodigoForm;

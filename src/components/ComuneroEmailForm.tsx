import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
import { comuneroService } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { useFormStore } from '../zustand/formStore';

const ComuneroEmailForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mailSuggestions, setMailSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { setField } = useFormStore();

  // Pre-rellenar email si viene desde error de duplicado
  useEffect(() => {
    const prefilledEmail = location.state?.prefilledEmail;
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [location.state]);

  // Dominios comunes para autocompletado
  const mailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

  const handleMailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const [local, domain] = value.split('@');
    if (local && !domain) {
      setMailSuggestions(mailDomains.map(d => `${local}@${d}`));
    } else {
      setMailSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validar email de comunero existente
      const response = await comuneroService.validarEmail(email);
      
      if (response.success) {
        // Guardar el email en el store de Zustand
        setField('mail', email);
        
        showToast('¡Código enviado! Revisa tu correo electrónico.', 'success');
        navigate('/comunero/validar', { state: { email } });
      } else {
        const errorMsg = response.error || 'Error al enviar el correo. Inténtalo de nuevo.';
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

  return (
    <PageTransition>
      <div className="bg-white rounded-4 p-4 shadow-lg border w-100 mx-auto" style={{maxWidth: 400}}>
      <BackButton />
      <h2 className="h4 fw-bold mb-4 text-center">Verificación de Comunero</h2>
      <form className="d-grid gap-3" onSubmit={handleSubmit}>
        <div className="position-relative">
          <label className="form-label">Introduce tu email</label>
          <input
            type="email"
            required
            className="form-control form-control-lg"
            value={email}
            onChange={handleMailChange}
            placeholder="tu@email.com"
          />
          {mailSuggestions.length > 0 && (
            <div className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm" style={{zIndex: 1000}}>
              {mailSuggestions.slice(0, 3).map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-2 border-bottom cursor-pointer hover-bg-light"
                  style={{cursor: 'pointer'}}
                  onClick={() => {
                    setEmail(suggestion);
                    setMailSuggestions([]);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-2 text-muted text-center">
          Se te enviará un código de validación a tu correo electrónico.
        </div>
        {error && <div className="text-danger text-center mb-2">{error}</div>}
        <button type="submit" className="btn btn-dark btn-lg w-100 fw-bold" disabled={loading}>
          {loading ? 'Enviando...' : 'Validar'}
        </button>
      </form>
      </div>
    </PageTransition>
  );
};

export default ComuneroEmailForm;

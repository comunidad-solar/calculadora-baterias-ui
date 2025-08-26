import { useFormStore } from '../zustand/formStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleAddressInput from './GoogleAddressInput';
import PageTransition from './PageTransition';
import { nuevoComuneroService } from '../services/apiService';
import { useToast } from '../context/ToastContext';


const ComuneroForm = () => {

  const { form, setField, submitForm } = useFormStore();
  const [telefonoError, setTelefonoError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Validación para teléfonos españoles (solo 9 dígitos, móvil 6/7, fijo 8/9)
  const validateTelefono = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 9) {
      if (/^[67]/.test(cleaned)) {
        setTelefonoError('');
        return true;
      } else if (/^[89]/.test(cleaned)) {
        setTelefonoError('');
        return true;
      } else {
        setTelefonoError('El número debe empezar por 6, 7 (móvil) o 8, 9 (fijo)');
        return false;
      }
    } else {
      setTelefonoError('El número debe tener 9 dígitos');
      return false;
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
    value = value.slice(0, 9);
    setField('telefono', value);
    validateTelefono(value);
  };
  const [mailSuggestions, setMailSuggestions] = useState<string[]>([]);

  const mailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

  const handleMailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setField('mail', value);
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
    
    try {
      const response = await nuevoComuneroService.crear({
        nombre: form.nombre,
        mail: form.mail,
        telefono: form.telefono,
        direccion: form.direccion,
        direccionComplementaria: form.direccionComplementaria
      });
      
      if (response.success) {
        showToast('¡Comunero registrado correctamente! Bienvenido.', 'success');
        // Resetear el formulario
        submitForm();
        // Redirigir a preguntas adicionales
        navigate('/preguntas-adicionales');
      } else {
        // Verificar si es error de email duplicado
        if (response.error && response.error.includes('Ya existe un registro con este email')) {
          // Redirigir al flujo de validación de email existente
          navigate('/comunero/email-duplicado', { 
            state: { 
              email: form.mail,
              fromRegistration: true 
            } 
          });
        } else {
          const errorMsg = response.error || 'Error al registrar el comunero. Inténtalo de nuevo.';
          showToast(errorMsg, 'error');
        }
      }
    } catch (err) {
      showToast('No se pudo conectar con el servidor. Comprueba tu conexión a internet.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="bg-white rounded-4 p-4 shadow-lg border w-100 mx-auto" style={{maxWidth: 400}}>
      <h2 className="h4 fw-bold mb-4 text-center">Ingresa tus datos</h2>
      <form
        className="d-grid gap-3"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="form-label">Nombre y Apellidos</label>
          <input
            type="text"
            required
            className="form-control form-control-lg"
            value={form.nombre}
            onChange={e => setField('nombre', e.target.value)}
          />
        </div>
        <div className="position-relative">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            required
            className="form-control form-control-lg"
            value={form.mail}
            onChange={handleMailChange}
            autoComplete="off"
          />
          {mailSuggestions.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{zIndex: 10, top: '100%'}}>
              {mailSuggestions.map(s => (
                <li
                  key={s}
                  className="list-group-item list-group-item-action"
                  style={{cursor: 'pointer'}}
                  onClick={() => {
                    setField('mail', s);
                    setMailSuggestions([]);
                  }}
                >{s}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            required
            className={`form-control form-control-lg ${telefonoError ? 'is-invalid' : ''}`}
            value={form.telefono}
            onChange={handleTelefonoChange}
            pattern="^[6789][0-9]{8}$"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={9}
          />
        
          {telefonoError && (
            <div className="invalid-feedback d-block">{telefonoError}</div>
          )}
        </div>
        <GoogleAddressInput
          value={form.direccion}
          onChange={(address: string) => setField('direccion', address)}
        />
        <div>
          <label className="form-label">Dirección complementaria</label>
          <input
            type="text"
            className="form-control form-control-lg"
            value={form.direccionComplementaria}
            onChange={e => setField('direccionComplementaria', e.target.value)}
            placeholder="Piso, puerta, bloque, etc. (opcional)"
          />
        </div>
        <div className="form-check mb-2">
          <input
            id="proteccionDatos"
            type="checkbox"
            required
            className="form-check-input"
            checked={form.proteccionDatos}
            onChange={e => setField('proteccionDatos', e.target.checked)}
          />
          <label htmlFor="proteccionDatos" className="form-check-label">
            Acepto la{' '}
            <a 
              href="https://comunidadsolar.es/politica-privacidad/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              protección de datos
            </a>
          </label>
        </div>
        {/* UTM oculto */}
        <input type="hidden" value={form.utm} />
        <button
          type="submit"
          className="btn btn-dark btn-lg w-100 fw-bold"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      </div>
    </PageTransition>
  );
};

export default ComuneroForm;

import { useFormStore } from '../zustand/formStore';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GoogleAddressInput from './GoogleAddressInput';
import PageTransition from './PageTransition';
import BackButton from './BackButton';
import { nuevoComuneroService } from '../services/apiService';
import { useToast } from '../context/ToastContext';


const ComuneroForm = () => {

  const { form, setField } = useFormStore();
  const [telefonoError, setTelefonoError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Capturar campaign_source de la URL al cargar el componente
  useEffect(() => {
    const campaignSource = searchParams.get('campaign_source') || searchParams.get('campaignSource');
    if (campaignSource) {
      setField('campaignSource', campaignSource);
    }
  }, [searchParams, setField]);

  // Validación para teléfonos españoles (solo 9 dígitos, móvil 6/7, fijo 8/9)
  const validateTelefono = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Validar que no tenga 7 o más dígitos iguales consecutivos
    const hasRepeatedDigits = /(.)\1{6,}/.test(cleaned);
    if (hasRepeatedDigits) {
      setTelefonoError('El número no puede tener 7 o más dígitos iguales consecutivos');
      return false;
    }
    
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
    
    // Usar el bypass del store de Zustand
    const bypass = form.bypass;
    
    try {
      const response = await nuevoComuneroService.crear({
        nombre: form.nombre,
        mail: form.mail,
        telefono: form.telefono,
        direccion: form.direccion,
        direccionComplementaria: form.direccionComplementaria,
        campaignSource: form.campaignSource,
        fsmState: "01_IN_ZONE_LEAD", // Estado inicial fijo
        codigoPostal: form.codigoPostal, // Nuevo campo de código postal
        ciudad: form.ciudad,
        provincia: form.provincia,
        pais: form.pais
      }, bypass);
      
      if (response.success) {
        if (bypass) {
          // Modo bypass: comunero nuevo creado, mostrar mensaje de asesor
          showToast('¡Datos guardados correctamente!', 'success');
          navigate('/comunero/email-duplicado', { 
            state: { 
              email: form.mail,
              fromRegistration: true,
              bypass: true // Pasar el bypass al componente
            } 
          });
        } else {
          // Modo normal: guardar datos del comunero en el store y continuar
          console.log('📋 Respuesta completa del nuevo comunero:', JSON.stringify(response, null, 2));
          
          // Para el caso "no soy comunero" (bypass=false), siempre guardar datos del formulario
          // como fallback si el backend no devuelve datos válidos
          let comuneroObject;
          
          if (response.data && Object.keys(response.data).length > 0) {
            console.log('📋 Data recibida del backend:', JSON.stringify(response.data, null, 2));
            
            // Verificar si los datos vienen directamente en response.data o en response.data.comunero
            const comuneroData = response.data.comunero || response.data;
            
            // Verificar si el backend devolvió datos válidos del comunero
            const tieneDataValidaComunero = comuneroData && 
              (comuneroData.id || comuneroData.contactId || 
               comuneroData.nombre || comuneroData.name ||
               comuneroData.email || comuneroData.mail);
            
            if (tieneDataValidaComunero) {
              console.log('📋 Usando datos del backend para comunero');
              comuneroObject = {
                id: comuneroData.id || comuneroData.contactId || response.data.id || 'temp-' + Date.now(),
                nombre: comuneroData.nombre || comuneroData.name || form.nombre,
                email: comuneroData.email || comuneroData.mail || form.mail,
                telefono: comuneroData.telefono || comuneroData.phone || form.telefono,
                direccion: comuneroData.direccion || comuneroData.address || form.direccion,
                codigoPostal: comuneroData.codigoPostal || comuneroData.postalCode || form.codigoPostal,
                ciudad: comuneroData.ciudad || comuneroData.city || form.ciudad,
                provincia: comuneroData.provincia || comuneroData.province || form.provincia
              };
            } else {
              console.log('⚠️ Backend no devolvió datos válidos del comunero, usando datos del formulario');
              comuneroObject = {
                id: response.data.id || 'temp-' + Date.now(),
                nombre: form.nombre,
                email: form.mail,
                telefono: form.telefono,
                direccion: form.direccion,
                codigoPostal: form.codigoPostal,
                ciudad: form.ciudad,
                provincia: form.provincia
              };
            }
          } else {
            console.log('⚠️ Backend no devolvió data, usando datos del formulario');
            comuneroObject = {
              id: 'temp-' + Date.now(),
              nombre: form.nombre,
              email: form.mail,
              telefono: form.telefono,
              direccion: form.direccion,
              codigoPostal: form.codigoPostal,
              ciudad: form.ciudad,
              provincia: form.provincia
            };
          }
          
          console.log('📋 Objeto comunero final:', JSON.stringify(comuneroObject, null, 2));
          
          setField('comunero', comuneroObject);
          
          // Guardar token y propuestaId si vienen en la respuesta (usar response.data directamente)
          if (response.data) {
            if ((response.data as any).token) {
              setField('token', (response.data as any).token);
              console.log('🔑 Token guardado:', (response.data as any).token);
            }
            if ((response.data as any).propuestaId) {
              setField('propuestaId', (response.data as any).propuestaId);
              console.log('🆔 PropuestaId guardado:', (response.data as any).propuestaId);
            }
            // Buscar enZona en la estructura correcta: conditions.enZona
            const enZonaValue = (response.data as any).conditions?.enZona || (response.data as any).enZona;
            if (enZonaValue !== undefined) {
              setField('enZona', enZonaValue);
              console.log('📍 EnZona guardado:', enZonaValue, 'tipo:', typeof enZonaValue);
            }
          }
          
          console.log('✅ Datos del comunero guardados en el store');
          
          showToast('¡Comunero registrado correctamente! Bienvenido.', 'success');
          // Redirigir a preguntas adicionales
          navigate('/preguntas-adicionales');
        }
      } else {
        // Verificar si es error de email duplicado
        if (response.error && response.error.includes('Ya existe un registro con este email')) {
          if (bypass) {
            // Modo bypass: comunero existente, también mostrar mensaje de asesor
            navigate('/comunero/email-duplicado', { 
              state: { 
                email: form.mail,
                fromRegistration: true,
                bypass: true // Pasar el bypass al componente
              } 
            });
          } else {
            // Modo normal: flujo de validación de email existente
            navigate('/comunero/email-duplicado', { 
              state: { 
                email: form.mail,
                fromRegistration: true 
              } 
            });
          }
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
      {/* Mostrar botón de volver solo si bypass es false */}
      {!form.bypass && <BackButton />}
      
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
          onChange={(value: string) => setField('direccion', value)}
          onPostalCodeChange={(codigoPostal: string) => setField('codigoPostal', codigoPostal)}
          onCityChange={(ciudad: string) => setField('ciudad', ciudad)}
          onProvinceChange={(provincia: string) => setField('provincia', provincia)}
          onCountryChange={(pais: string) => setField('pais', pais)}
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
        {/* Campaign Source oculto */}
        <input type="hidden" value={form.campaignSource} />
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

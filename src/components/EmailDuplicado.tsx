import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
import { useFormStore } from '../zustand/formStore';

const EmailDuplicado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { form } = useFormStore();
  const email = location.state?.email;
  const fromRegistration = location.state?.fromRegistration;
  // Usar bypass del state si está disponible, sino del store
  const bypass = location.state?.bypass !== undefined ? location.state?.bypass : form.bypass;

  // Redirigir si no hay email
  useEffect(() => {
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleValidarEmail = () => {
    // Redirigir al flujo de validación de email existente
    navigate('/comunero', { state: { prefilledEmail: email } });
  };

  const handleVolverRegistro = () => {
    // Volver al registro pero mantener los datos excepto el email
    navigate('/nuevo-comunero');
  };

  return (
    <PageTransition>
      <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 500}}>
        <BackButton />
        
        <div className="text-center mb-4">
          <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
            <span style={{fontSize: '2.5rem'}}>👤</span>
          </div>
          <h2 className="h4 fw-bold mb-3">
            {bypass 
              ? "¡Perfecto! Hemos recibido tu solicitud" 
              : "¡Ya estás en nuestra base de datos!"
            }
          </h2>
          <p className="text-muted mb-4">
            {bypass ? (
              <>
                Hemos registrado tu interés en nuestras soluciones de energía solar con el email <strong>{email}</strong>.
                <span className="d-block mt-2">
                  <strong>Un asesor especializado se contactará contigo próximamente</strong> para brindarte toda la información personalizada que necesitas.
                </span>
              </>
            ) : (
              <>
                El email <strong>{email}</strong> ya está registrado en nuestro sistema.
                {fromRegistration && (
                  <span className="d-block mt-2">
                    No necesitas registrarte de nuevo.
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        <div className="alert alert-info border-0 mb-4">
          <div className="d-flex align-items-start">
            <span className="me-2">ℹ️</span>
            <div>
              {bypass ? (
                <>
                  <strong className="d-block mb-2">¿Qué sucede ahora?</strong>
                  <p className="mb-0 small">
                    Tu solicitud de información ha sido procesada correctamente. En las próximas  horas, 
                    un especialista de nuestro equipo comercial se pondrá en contacto contigo para:
                  </p>
                  <ul className="small mt-2 mb-0 ps-3">
                    <li>Resolver todas tus dudas sobre energía solar</li>
                    <li>Evaluar tu caso específico</li>
                    <li>Ofrecerte las mejores opciones disponibles</li>
                  </ul>
                </>
              ) : (
                <>
                  <strong className="d-block mb-2">¿Qué significa esto?</strong>
                  <p className="mb-0 small">
                    Ya tienes una cuenta con nosotros. Para acceder a tu información y generar 
                    una propuesta, necesitas validar tu correo electrónico.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="d-grid gap-3">
          {bypass ? (
            // Modo bypass: mostrar mensaje de contacto
            <div className="text-center">
              <div className="bg-success bg-opacity-10 rounded-3 p-4 mb-3">
                <span className="text-success" style={{fontSize: '2rem'}}>✅</span>
                <p className="fw-bold text-success mb-0 mt-2">¡Solicitud registrada correctamente!</p>
                <small className="text-muted">Nos pondremos en contacto contigo pronto</small>
              </div>
            </div>
          ) : (
            // Modo normal: botón de validación
            <button 
              className="btn btn-primary btn-lg fw-bold"
              onClick={handleValidarEmail}
            >
              🔐 Validar mi correo electrónico
            </button>
          )}
          
          <div className="text-center">
            <span className="text-muted">¿Te equivocaste de email? </span>
            <button
              type="button"
              className="btn btn-link p-0 fw-semibold"
              onClick={handleVolverRegistro}
              style={{textDecoration: 'none'}}
            >
              Volver al registro
            </button>
          </div>
        </div>

        <div className="border-top mt-4 pt-4">
          {bypass ? (
            // Modo bypass: pasos de contacto
            <div className="row text-center">
              <div className="col">
                <div className="text-success fw-bold h5 mb-1">✅</div>
                <small className="text-muted">Solicitud recibida</small>
              </div>
              <div className="col">
                <div className="text-primary fw-bold h5 mb-1">📞</div>
                <small className="text-muted">Contacto personal</small>
              </div>
              <div className="col">
                <div className="text-muted fw-bold h5 mb-1">☀️</div>
                <small className="text-muted">Solución solar</small>
              </div>
            </div>
          ) : (
            // Modo normal: pasos de validación
            <div className="row text-center">
              <div className="col">
                <div className="text-primary fw-bold h5 mb-1">1</div>
                <small className="text-muted">Validar email</small>
              </div>
              <div className="col">
                <div className="text-muted fw-bold h5 mb-1">2</div>
                <small className="text-muted">Introducir código</small>
              </div>
              <div className="col">
                <div className="text-muted fw-bold h5 mb-1">3</div>
                <small className="text-muted">Ver propuesta</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default EmailDuplicado;

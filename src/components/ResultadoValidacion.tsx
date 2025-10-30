import { useState, useEffect } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import type { Usuario } from '../context/UsuarioContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
import GoogleAddressInput from './GoogleAddressInput';
import { useFormStore } from '../zustand/formStore';

const ResultadoValidacion = () => {
  const { validacionData, usuario, updateUsuario, setValidacionData } = useUsuario();
  const { form } = useFormStore();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Usuario>(usuario || {} as Usuario);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const [direccionOriginalVacia, setDireccionOriginalVacia] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const bypass = form.bypass;

  // Efecto para cargar datos desde navigation state si el contexto está vacío
  useEffect(() => {
    // Si no hay datos en el contexto pero sí en location.state, cargarlos
    if ((!validacionData || !usuario) && location.state?.validacionData) {
      setValidacionData(location.state.validacionData);
    }
  }, [validacionData, usuario, location.state, setValidacionData]);

  // Animaciones de entrada y auto-edición si falta dirección
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setCardAnimated(true);
      
      // Detectar si la dirección estaba vacía originalmente
      if (usuario && (!usuario.direccion || usuario.direccion.trim() === '')) {
        setDireccionOriginalVacia(true);
      }
      
      // Auto-activar edición solo si está en zona que puede generar propuesta y no hay dirección
      const canGenerateProposal = validacionData?.enZona === "inZone" || 
                                  validacionData?.enZona === "inZoneWithCost" || 
                                  validacionData?.enZona === "NoCPAvailable";
      if (canGenerateProposal && usuario && (!usuario.direccion || usuario.direccion.trim() === '')) {
        setEditMode(true);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [validacionData, usuario]);

  if (!validacionData || !usuario) {
     navigate('/');
    return null;
  }

  const handleSaveChanges = async () => {
    // Validar campos obligatorios solo para usuarios que pueden generar propuesta
    const canGenerateProposal = validacionData.enZona === "inZone" || 
                                validacionData.enZona === "inZoneWithCost" || 
                                validacionData.enZona === "NoCPAvailable";
    
    if (canGenerateProposal) {
      if (!editData.direccion || editData.direccion.trim() === '') {
        showToast('Por favor completa tu dirección', 'error');
        return;
      }
      if (!editData.tipoInstalacion) {
        showToast('Por favor selecciona el tipo de instalación', 'error');
        return;
      }
      if (editData.tieneBaterias === undefined || editData.tieneBaterias === null) {
        showToast('Por favor indica si ya tienes baterías instaladas', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      // Simular llamada al backend para actualizar datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUsuario(editData);
      setEditMode(false);
      showToast('Datos actualizados correctamente', 'success');
    } catch (error) {
      showToast('Error al actualizar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData(usuario);
    setEditMode(false);
  };

  const handleConsultarAsesor = () => {
    // Aquí se podría abrir un modal, redirigir a WhatsApp, etc.
    showToast('Contactando con nuestro equipo de asesores...', 'info');
    // Ejemplo: window.open('https://wa.me/34600000000?text=Hola, necesito consultar sobre mi zona de cobertura');
  };

  const handleContinuarPropuesta = () => {
    // Solo permitir continuar si puede generar propuesta (no para outZone)
    const canGenerateProposal = validacionData.enZona === "inZone" || 
                                validacionData.enZona === "inZoneWithCost" || 
                                validacionData.enZona === "NoCPAvailable";
    
    if (!canGenerateProposal) {
      showToast('No es posible generar propuesta para esta ubicación', 'warning');
      return;
    }
    
    // Verificar que los campos obligatorios estén completos
    if (!usuario.tipoInstalacion) {
      showToast('Por favor completa el tipo de instalación antes de continuar', 'warning');
      setEditMode(true);
      return;
    }
    if (usuario.tieneBaterias === undefined || usuario.tieneBaterias === null) {
      showToast('Por favor indica si ya tienes baterías instaladas', 'warning');
      setEditMode(true);
      return;
    }
    
    // Navegar a preguntas adicionales
    navigate('/preguntas-adicionales', { replace: true });
  };

  return (
    <PageTransition>
      <style>{`
        .fade-in-result {
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 5}px);
          transition: all 0.3s ease-out;
        }
        
        .card-enter-result {
          opacity: ${cardAnimated ? 1 : 0};
          transform: scale(${cardAnimated ? 1 : 0.99}) translateY(${cardAnimated ? 0 : 3}px);
          transition: all 0.4s ease-out;
        }
        
        .status-icon-result {
          opacity: ${isVisible ? 1 : 0};
          transform: scale(${isVisible ? 1 : 0.95});
          transition: all 0.3s ease-out 0.1s;
        }
        
        .edit-transition-result {
          transition: all 0.25s ease-out;
        }
        
        .button-hover-result {
          transition: all 0.15s ease-out;
        }
        
        .button-hover-result:hover {
          transform: translateY(-0.5px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.08) !important;
        }
        
        .form-field-result {
          transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }
        
        .loading-spinner-result {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .card-glow-result {
          box-shadow: 0 2px 15px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
        }
        
        .card-glow-result:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
      `}</style>
      
      <div className="container py-4">
        <div className={`bg-white rounded-4 p-4 shadow-lg border w-100 mx-auto card-glow-result ${cardAnimated ? 'card-enter-result' : ''}`} style={{maxWidth: 800}}>
          <div className="fade-in-result">
            <BackButton />
          </div>
          
          {/* Header con estado */}
          <div className="text-center mb-4 fade-in-result">
            <div className={`bg-${(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") ? 'success' : (validacionData.enZona === "outZone" ? 'warning' : (bypass ? 'info' : 'warning'))} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 status-icon-result`} style={{width: '80px', height: '80px'}}>
              <span style={{fontSize: '2.5rem'}}>
                {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") 
                  ? '✅' 
                  : (validacionData.enZona === "outZone" 
                      ? '📍' 
                      : (bypass ? '📋' : '⚠️')
                    )
                }
              </span>
            </div>
            <h2 className="h4 fw-bold mb-2">
              {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable")
                ? '¡Genial! Podemos ayudarte' 
                : (validacionData.enZona === "outZone"
                    ? 'Esta es la información que tenemos:'
                    : (bypass 
                        ? '¡Perfecto! Hemos guardado tus datos'
                        : 'Zona fuera de cobertura'
                      )
                  )
              }
            </h2>
            {validacionData.enZona === "outZone" && (
              <div className="bg-light rounded-3 p-4 mb-3">
                <p className="text-muted mb-2" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Por el momento no podemos ofrecerte una propuesta para tu ubicación, pero 
                  <strong> todos los días agregamos nuevas ubicaciones</strong> a nuestro servicio.
                </p>
                <p className="text-primary fw-medium mb-0">
                  Como ya tenemos tus datos, <strong>te contactaremos apenas tengamos una propuesta disponible para ti</strong>.
                </p>
              </div>
            )}
            {(validacionData.enZona !== "inZone" && validacionData.enZona !== "inZoneWithCost" && validacionData.enZona !== "NoCPAvailable" && validacionData.enZona !== "outZone") && (
              <p className="text-muted">
                {bypass 
                  ? 'Tu solicitud de información ha sido registrada correctamente. Un asesor especializado se pondrá en contacto contigo próximamente para brindarte toda la información sobre nuestras soluciones de energía solar.'
                  : validacionData.motivo
                }
              </p>
            )}
          </div>

        {/* Datos del usuario */}
        <div className="card mb-4 fade-in-result edit-transition-result">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Tus datos</h5>
            <button 
              className="btn btn-outline-primary btn-sm button-hover-result"
              onClick={() => setEditMode(!editMode)}
              disabled={loading}
            >
              {editMode ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          <div className="card-body">
            {editMode ? (
              <div className="row g-3">
                <div className="col-md-6 form-field-result">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.nombre || ''}
                    onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                  />
                </div>
                <div className="col-md-6 form-field-result">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                  />
                </div>
                <div className="col-md-6 form-field-result">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={editData.telefono || ''}
                    onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                  />
                </div>
                <div className="col-md-6 form-field-result">
                  <label className="form-label">Ciudad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.ciudad || ''}
                    onChange={(e) => setEditData({...editData, ciudad: e.target.value})}
                  />
                </div>
                <div className="col-12 form-field-result">
                  {direccionOriginalVacia ? (
                    // Si la dirección estaba vacía originalmente, siempre usar Google Places
                    <GoogleAddressInput
                      value={editData.direccion || ''}
                      onChange={(newAddress) => setEditData({...editData, direccion: newAddress})}
                    />
                  ) : (
                    // Si ya tenía dirección, usar input normal con label
                    <>
                      <label className="form-label">
                        Dirección {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editData.direccion || ''}
                        onChange={(e) => setEditData({...editData, direccion: e.target.value})}
                        placeholder="Introduce tu dirección completa"
                      />
                    </>
                  )}
                  {direccionOriginalVacia && (validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") && (
                    <small className="form-text text-muted">
                      La dirección es necesaria para calcular la propuesta de baterías
                    </small>
                  )}
                </div>
                {/* Solo mostrar campos de instalación para usuarios que pueden generar propuesta */}
                {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") && (
                  <>
                    <div className="col-md-6 form-field-result">
                      <label className="form-label">
                        Tipo de instalación <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={editData.tipoInstalacion || ''}
                        onChange={(e) => setEditData({...editData, tipoInstalacion: e.target.value as 'monofasica' | 'trifasica' | 'desconozco'})}
                        required
                      >
                        <option value="">Selecciona el tipo de instalación</option>
                        <option value="monofasica">Monófasica</option>
                        <option value="trifasica">Trifásica</option>
                        <option value="desconozco">Lo desconozco (quiero que me contacten)</option>
                      </select>
                    </div>
                    <div className="col-md-6 form-field-result">
                      <label className="form-label">
                        ¿Ya tienes baterías instaladas? <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={editData.tieneBaterias === undefined ? '' : editData.tieneBaterias ? 'si' : 'no'}
                        onChange={(e) => setEditData({
                          ...editData, 
                          tieneBaterias: e.target.value === 'si' ? true : e.target.value === 'no' ? false : undefined
                        })}
                        required
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="col-12 d-flex gap-2 justify-content-end form-field-result">
                  <button 
                    className="btn btn-secondary button-hover-result"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary button-hover-result"
                    onClick={handleSaveChanges}
                    disabled={loading}
                  >
                    {loading && <div className="loading-spinner-result me-2" style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%'}}></div>}
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-md-6">
                  <strong className="text-muted d-block">Nombre:</strong>
                  <span>{usuario.nombre}</span>
                </div>
                <div className="col-md-6">
                  <strong className="text-muted d-block">Email:</strong>
                  <span>{usuario.email}</span>
                </div>
                <div className="col-md-6">
                  <strong className="text-muted d-block">Teléfono:</strong>
                  <span>{usuario.telefono}</span>
                </div>
                <div className="col-md-6">
                  <strong className="text-muted d-block">Ciudad:</strong>
                  <span>{usuario.ciudad || 'No especificada'}</span>
                </div>
                <div className="col-12">
                  <strong className="text-muted d-block">Dirección:</strong>
                  {usuario.direccion && usuario.direccion.trim() !== '' ? (
                    <span>{usuario.direccion}</span>
                  ) : (
                    <div>
                      <span className="text-warning">⚠️ No completada</span>
                      {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") && (
                        <small className="d-block text-muted mt-1">
                          Es necesario completar la dirección para generar una propuesta
                        </small>
                      )}
                    </div>
                  )}
                </div>
                {/* Solo mostrar información de instalación para usuarios que pueden generar propuesta */}
                {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") && (
                  <>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Tipo de instalación:</strong>
                      <span>
                        {usuario.tipoInstalacion === 'monofasica' && 'Monófasica'}
                        {usuario.tipoInstalacion === 'trifasica' && 'Trifásica'}
                        {usuario.tipoInstalacion === 'desconozco' && 'Lo desconozco (quiero que me contacten)'}
                        {!usuario.tipoInstalacion && <span className="text-warning">⚠️ Pendiente de seleccionar</span>}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">¿Ya tienes baterías instaladas?:</strong>
                      <span>
                        {usuario.tieneBaterias === true && 'Sí'}
                        {usuario.tieneBaterias === false && 'No'}
                        {usuario.tieneBaterias === undefined && <span className="text-warning">⚠️ Pendiente de seleccionar</span>}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Acciones según el estado */}
        <div className="d-grid gap-2 fade-in-result">
          {(validacionData.enZona === "inZone" || validacionData.enZona === "inZoneWithCost" || validacionData.enZona === "NoCPAvailable") ? (
            <>
              <button 
                className="btn btn-primary btn-lg button-hover-result"
                onClick={handleContinuarPropuesta}
                style={{
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                  border: 'none'
                }}
              >
                Continuar con la propuesta
              </button>
              <small className="text-muted text-center">
                Te mostraremos una propuesta personalizada basada en tu ubicación
              </small>
            </>
          ) : validacionData.enZona === "outZone" ? (
            // Caso especial para outZone: solo mostrar información de contacto
            <div className="text-center">
              <div className="bg-info bg-opacity-10 rounded-3 p-4 mb-3">
                <span className="text-info" style={{fontSize: '2rem'}}>📞</span>
                <p className="fw-bold text-info mb-2 mt-2">Nos pondremos en contacto contigo</p>
                <p className="text-muted mb-0">
                  Te contactaremos al <strong>{usuario.telefono}</strong> tan pronto como tengamos 
                  cobertura disponible en tu zona.
                </p>
              </div>
              <div className="d-flex justify-content-center align-items-center text-muted">
                <span className="me-2">✉️</span>
                <small>También te enviaremos información a {usuario.email}</small>
              </div>
            </div>
          ) : (
            <>
              {bypass ? (
                // Modo bypass: mostrar mensaje de confirmación
                <div className="text-center">
                  <div className="bg-success bg-opacity-10 rounded-3 p-4 mb-3">
                    <span className="text-success" style={{fontSize: '2rem'}}>✅</span>
                    <p className="fw-bold text-success mb-2 mt-2">¡Solicitud registrada correctamente!</p>
                    <p className="text-muted mb-0">
                      Nuestro equipo de especialistas revisará tu caso específico y se pondrá en contacto contigo 
                      en las próximas <strong>24-48 horas</strong> para ofrecerte las mejores soluciones disponibles.
                    </p>
                  </div>
                  <div className="d-flex justify-content-center align-items-center text-muted">
                    <span className="me-2">📞</span>
                    <small>Te contactaremos al {usuario.telefono}</small>
                  </div>
                </div>
              ) : (
                // Modo normal: botón de consultar asesor
                <>
                  <button 
                    className="btn btn-warning btn-lg button-hover-result"
                    onClick={handleConsultarAsesor}
                    style={{
                      background: 'linear-gradient(135deg, #ffc107 0%, #ff8500 100%)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    Consultar con un asesor
                  </button>
                  <small className="text-muted text-center">
                    Nuestro equipo revisará tu caso y te contactará para ver las opciones disponibles
                  </small>
                </>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResultadoValidacion;

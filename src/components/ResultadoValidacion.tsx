import { useState, useEffect } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import type { Usuario } from '../context/UsuarioContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import BackButton from './BackButton';
import PageTransition from './PageTransition';

const ResultadoValidacion = () => {
  const { validacionData, usuario, updateUsuario } = useUsuario();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Usuario>(usuario || {} as Usuario);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Animaciones de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setCardAnimated(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  if (!validacionData || !usuario) {
    navigate('/');
    return null;
  }

  const handleSaveChanges = async () => {
    // Validar campos obligatorios para usuarios en zona
    if (validacionData.enZona) {
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
    // Verificar que los campos obligatorios estén completos
    if (validacionData.enZona) {
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
    }
    navigate('/propuesta');
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
            <div className={`bg-${validacionData.enZona ? 'success' : 'warning'} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 status-icon-result`} style={{width: '80px', height: '80px'}}>
              <span style={{fontSize: '2.5rem'}}>{validacionData.enZona ? '✅' : '⚠️'}</span>
            </div>
            <h2 className="h4 fw-bold mb-2">
              {validacionData.enZona ? '¡Genial! Podemos ayudarte' : 'Zona fuera de cobertura'}
            </h2>
            {!validacionData.enZona && validacionData.motivo && (
              <p className="text-muted">{validacionData.motivo}</p>
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
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.direccion || ''}
                    onChange={(e) => setEditData({...editData, direccion: e.target.value})}
                  />
                </div>
                {validacionData.enZona && (
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
                  <span>{usuario.direccion}</span>
                </div>
                {validacionData.enZona && (
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
          {validacionData.enZona ? (
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
          ) : (
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
        </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResultadoValidacion;

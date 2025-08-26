import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from './PageTransition';

const PreguntasAdicionales = () => {
  const [tieneInstalacionFV, setTieneInstalacionFV] = useState<boolean | null>(null);
  const [tipoInstalacion, setTipoInstalacion] = useState<string>('');
  const [tieneInversorHuawei, setTieneInversorHuawei] = useState<string>('');
  const [tipoInversorHuawei, setTipoInversorHuawei] = useState<string>('');
  const [fotoInversor, setFotoInversor] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (tieneInstalacionFV === null) {
      showToast('Por favor indica si tienes instalación fotovoltaica', 'error');
      setLoading(false);
      return;
    }

    // Validación para inversor Huawei
    if (tieneInstalacionFV && !tieneInversorHuawei) {
      showToast('Por favor indica si tienes un inversor híbrido Huawei', 'error');
      setLoading(false);
      return;
    }

    // Si tiene Huawei y respondió "sí", validar tipo
    if (tieneInstalacionFV && tieneInversorHuawei === 'si' && !tipoInversorHuawei) {
      showToast('Por favor selecciona el tipo de inversor Huawei', 'error');
      setLoading(false);
      return;
    }

    // Si tiene Huawei "sí" y tipo "desconozco", validar foto
    if (tieneInstalacionFV && tieneInversorHuawei === 'si' && tipoInversorHuawei === 'desconozco' && !fotoInversor) {
      showToast('Por favor sube una foto del inversor', 'error');
      setLoading(false);
      return;
    }

    // Si tiene Huawei y respondió "desconozco", validar foto
    if (tieneInstalacionFV && tieneInversorHuawei === 'desconozco' && !fotoInversor) {
      showToast('Por favor sube una foto del inversor', 'error');
      setLoading(false);
      return;
    }

    if (!tieneInstalacionFV && !tipoInstalacion) {
      showToast('Por favor selecciona el tipo de instalación', 'error');
      setLoading(false);
      return;
    }

    try {
      // Simular envío de datos adicionales al backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos a guardar/enviar
      const datosAdicionales = {
        tieneInstalacionFV,
        ...(tieneInstalacionFV ? { 
          tieneInversorHuawei,
          ...(tieneInversorHuawei === 'si' ? { 
            tipoInversorHuawei,
            ...(tipoInversorHuawei === 'desconozco' ? { fotoInversor: fotoInversor?.name } : {})
          } : {}),
          ...(tieneInversorHuawei === 'desconozco' ? { fotoInversor: fotoInversor?.name } : {})
        } : { tipoInstalacion })
      };

      console.log('Datos adicionales:', datosAdicionales);
      
      showToast('¡Información guardada correctamente!', 'success');
      
      // Redirigir a la página de propuesta o dashboard
      navigate('/propuesta');
      
    } catch (error) {
      showToast('Error al guardar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInstalacionChange = (valor: boolean) => {
    setTieneInstalacionFV(valor);
    // Reset campos dependientes
    setTipoInstalacion('');
    setTieneInversorHuawei('');
    setTipoInversorHuawei('');
    setFotoInversor(null);
  };

  const handleHuaweiChange = (valor: string) => {
    setTieneInversorHuawei(valor);
    // Reset campos dependientes
    setTipoInversorHuawei('');
    setFotoInversor(null);
  };

  const handleTipoInversorChange = (valor: string) => {
    setTipoInversorHuawei(valor);
    // Reset foto si no es "desconozco"
    if (valor !== 'desconozco') {
      setFotoInversor(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea imagen
      if (file.type.startsWith('image/')) {
        setFotoInversor(file);
      } else {
        showToast('Por favor selecciona una imagen válida', 'error');
        e.target.value = '';
      }
    }
  };

  return (
    <PageTransition>
      <div className="container py-4">
        <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 600}}>
          
          {/* Banner principal */}
          <div className="text-center mb-5">
            <div className="bg-primary bg-opacity-10 rounded-3 p-4 mb-4">
              <h1 className="h3 fw-bold text-primary mb-3">
                PARA PODER OFRECERTE UNA PROPUESTA PERSONALIZADA
              </h1>
              <p className="h5 text-secondary mb-0">
                NECESITAMOS QUE CONTESTES A LAS SIGUIENTES PREGUNTAS
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="d-grid gap-4">
            
            {/* Pregunta 1: ¿Tienes instalación fotovoltaica? */}
            <div>
              <label className="form-label h5 fw-bold mb-3">
                ¿Tienes instalación fotovoltaica instalada? <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="instalacionFV"
                    id="instalacionSi"
                    checked={tieneInstalacionFV === true}
                    onChange={() => handleInstalacionChange(true)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="instalacionSi">
                    Sí
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="instalacionFV"
                    id="instalacionNo"
                    checked={tieneInstalacionFV === false}
                    onChange={() => handleInstalacionChange(false)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="instalacionNo">
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Pregunta sobre inversor Huawei - Solo si tiene instalación FV */}
            {tieneInstalacionFV === true && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Tienes un inversor híbrido Huawei? <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inversorHuawei"
                      id="huaweiSi"
                      checked={tieneInversorHuawei === 'si'}
                      onChange={() => handleHuaweiChange('si')}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="huaweiSi">
                      Sí
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inversorHuawei"
                      id="huaweiNo"
                      checked={tieneInversorHuawei === 'no'}
                      onChange={() => handleHuaweiChange('no')}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="huaweiNo">
                      No
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inversorHuawei"
                      id="huaweiDesconozco"
                      checked={tieneInversorHuawei === 'desconozco'}
                      onChange={() => handleHuaweiChange('desconozco')}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="huaweiDesconozco">
                      Lo desconozco
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Si tiene Huawei = SÍ - Tipo de inversor Huawei */}
            {tieneInstalacionFV === true && tieneInversorHuawei === 'si' && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  Tipo de inversor Huawei <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={tipoInversorHuawei}
                  onChange={(e) => handleTipoInversorChange(e.target.value)}
                  required
                >
                  <option value="">Selecciona el tipo</option>
                  <option value="monofasico">Monofásico</option>
                  <option value="trifasico">Trifásico</option>
                  <option value="desconozco">Lo desconozco</option>
                </select>
              </div>
            )}

            {/* Si tipo de inversor Huawei = DESCONOZCO - Upload foto */}
            {tieneInstalacionFV === true && tieneInversorHuawei === 'si' && tipoInversorHuawei === 'desconozco' && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  Foto del inversor <span className="text-danger">*</span>
                </label>
                <div className="border-2 border-dashed border-primary rounded-3 p-4 text-center">
                  <input
                    type="file"
                    id="fotoInversorTipo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                  <label htmlFor="fotoInversorTipo" className="btn btn-outline-primary btn-lg w-100" style={{cursor: 'pointer'}}>
                    {fotoInversor ? (
                      <>
                        <span className="me-2">✅</span>
                        {fotoInversor.name}
                      </>
                    ) : (
                      <>
                        <span className="me-2">📷</span>
                        Subir foto del inversor
                      </>
                    )}
                  </label>
                  <small className="text-muted d-block mt-2">
                    Sube una foto clara donde se vea la marca y modelo del inversor
                  </small>
                </div>
              </div>
            )}

            {/* Si tiene Huawei = DESCONOZCO - Upload foto */}
            {tieneInstalacionFV === true && tieneInversorHuawei === 'desconozco' && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  Foto del inversor <span className="text-danger">*</span>
                </label>
                <div className="border-2 border-dashed border-primary rounded-3 p-4 text-center">
                  <input
                    type="file"
                    id="fotoInversor"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                  <label htmlFor="fotoInversor" className="btn btn-outline-primary btn-lg w-100" style={{cursor: 'pointer'}}>
                    {fotoInversor ? (
                      <>
                        <span className="me-2">✅</span>
                        {fotoInversor.name}
                      </>
                    ) : (
                      <>
                        <span className="me-2">📷</span>
                        Subir foto del inversor
                      </>
                    )}
                  </label>
                  <small className="text-muted d-block mt-2">
                    Sube una foto clara donde se vea la marca y modelo del inversor
                  </small>
                </div>
              </div>
            )}

            {/* Si tiene Huawei = NO - Mensaje informativo */}
            {tieneInstalacionFV === true && tieneInversorHuawei === 'no' && (
              <div className="fade-in-result">
                <div className="alert alert-info border-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">ℹ️</span>
                    <small>
                      <strong>Perfecto.</strong> Continuaremos con tu propuesta personalizada.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Si NO tiene instalación FV - Tipo de instalación */}
            {tieneInstalacionFV === false && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  Tipo de instalación <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={tipoInstalacion}
                  onChange={(e) => setTipoInstalacion(e.target.value)}
                  required
                >
                  <option value="">Selecciona el tipo de instalación</option>
                  <option value="trifasica">Trifásica</option>
                  <option value="monofasica">Monofásica</option>
                  <option value="desconozco">Lo desconozco</option>
                </select>
              </div>
            )}

            {/* Botón enviar */}
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg fw-bold button-hover-result"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                  border: 'none'
                }}
              >
                {loading ? 'Guardando...' : 'Continuar con mi propuesta'}
              </button>
              <small className="text-muted text-center">
                Esta información nos ayudará a crear una propuesta personalizada para ti
              </small>
            </div>
          </form>

          {/* Estilos CSS */}
          <style>{`
            .fade-in-result {
              opacity: 1;
              transform: translateY(0);
              transition: all 0.3s ease-out;
            }
            
            .button-hover-result {
              transition: all 0.2s ease-out;
            }
            
            .button-hover-result:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }
            
            .form-check-input:checked {
              background-color: #0d6efd;
              border-color: #0d6efd;
            }
            
            .form-select-lg {
              font-size: 1.1rem;
              padding: 0.75rem;
            }

            .border-dashed {
              border-style: dashed !important;
            }
          `}</style>
        </div>
      </div>
    </PageTransition>
  );
};

export default PreguntasAdicionales;
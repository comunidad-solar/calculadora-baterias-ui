import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { bateriaService } from '../services/apiService';
import { useFormStore } from '../zustand/formStore';
import { FSM_STATES } from '../types/fsmTypes';
import PageTransition from './PageTransition';

const PreguntasAdicionales = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Usar formStore principal para persistir datos con Redux DevTools
  const { 
    form, 
    setRespuestaPregunta, 
    setFsmState 
  } = useFormStore();
  
  // Obtener respuestas de preguntas del store principal
  const {
    tieneInstalacionFV = null,
    tieneInversorHuawei = '',
    tipoInversorHuawei = '',
    fotoInversor = null,
    tipoInstalacion = '',
    tipoCuadroElectrico = '',
    fotoDisyuntor = null,
    analisisIA = null,
    tieneBaterias = null,
    tipoBaterias = '',
    capacidadCanadian = '',
    capacidadHuawei = '',
    instalacionCerca10m = null
  } = form.respuestasPreguntas || {};

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

    // Si no tiene instalación FV pero sabe el tipo (monofásica/trifásica), validar si tiene baterías
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === null) {
      showToast('Por favor indica si ya tienes baterías instaladas', 'error');
      setLoading(false);
      return;
    }

    // Si tiene baterías, validar tipo de baterías
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && !tipoBaterias) {
      showToast('Por favor indica qué tipo de baterías tienes instaladas', 'error');
      setLoading(false);
      return;
    }

    // Si seleccionó CANADIAN, validar capacidad
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && tipoBaterias === 'canadian' && !capacidadCanadian) {
      showToast('Por favor selecciona la capacidad de tus baterías CANADIAN', 'error');
      setLoading(false);
      return;
    }

    // Si seleccionó HUAWEI, validar capacidad
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && tipoBaterias === 'huawei' && !capacidadHuawei) {
      showToast('Por favor selecciona la capacidad de tus baterías HUAWEI', 'error');
      setLoading(false);
      return;
    }

    // Si NO tiene baterías, validar distancia de instalación
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === false && instalacionCerca10m === null) {
      showToast('Por favor indica si podríamos realizar la instalación a menos de 10m del cuadro eléctrico', 'error');
      setLoading(false);
      return;
    }

    // Si no tiene instalación FV y desconoce el tipo, validar cuadro eléctrico
    if (!tieneInstalacionFV && tipoInstalacion === 'desconozco' && !tipoCuadroElectrico) {
      showToast('Por favor identifica el tipo de cuadro eléctrico o confirma que lo desconoces', 'error');
      setLoading(false);
      return;
    }

    // Si selecciona "ninguno" de los cuadros, verificar análisis de IA
    if (!tieneInstalacionFV && tipoInstalacion === 'desconozco' && tipoCuadroElectrico === 'ninguno') {
      
      // Si hay una foto y se analizó por IA
      if (fotoDisyuntor && analisisIA && !analisisIA.procesando) {
        const { tipoDetectado } = analisisIA;
        
        if (tipoDetectado === 'desconocido') {
          // IA no pudo identificar el tipo - contactar asesor
          try {
            const datosCompletos = {
              propuestaId: form.propuestaId || '', // ID global principal
              contactId: form.comunero?.id || '',
              email: form.comunero?.email || '',
              
              tieneInstalacionFV: false,
              tipoInstalacion: 'desconozco',
              tipoCuadroElectrico: 'ninguno',
              requiereContactoManual: true,
              
              ...(fotoDisyuntor && { fotoDisyuntor: fotoDisyuntor.name }),
              analisisIA: analisisIA,
              
              nombre: form.comunero?.nombre || '',
              telefono: form.comunero?.telefono || '',
              direccion: form.comunero?.direccion || '',
              ciudad: form.comunero?.ciudad || '',
              provincia: form.comunero?.provincia || '',
              codigoPostal: form.comunero?.codigoPostal || '',
              
              token: form.token || '',
              dealId: form.dealId || '', // Mantener por compatibilidad
              enZona: form.enZona || 'outZone'
            };

            console.log('📤 IA no identificó el tipo - Enviando solicitud de contacto manual:', datosCompletos);

            const response = await bateriaService.contactarAsesorDesconoceUnidad(datosCompletos);
            
            if (response.success) {
              showToast('No se pudo reconocer el tipo de cuadro eléctrico. Un asesor especializado se pondrá en contacto contigo pronto para evaluar tu caso específico.', 'info');
              
              navigate('/gracias-contacto', { 
                state: { 
                  motivo: 'ia-no-reconoce',
                  conIA: true,
                  mensaje: 'Nuestro sistema de IA ha analizado tu foto pero no pudo determinar el tipo de cuadro eléctrico. Un especialista revisará tu caso manualmente y te contactará con la evaluación personalizada.'
                } 
              });
            } else {
              throw new Error(response.error || 'Error al crear la solicitud');
            }
            
            return;
            
          } catch (error) {
            console.error('Error al crear solicitud tras análisis IA:', error);
            showToast('Error al registrar la información', 'error');
            setLoading(false);
            return;
          }
          
        } else {
          // IA identificó el tipo (monofásico o trifásico) - continuar con flujo normal
          console.log('✅ IA identificó el tipo:', tipoDetectado);
          
          // Actualizar el tipo de instalación según lo detectado por IA
          const tipoInstalacionDetectado = tipoDetectado === 'monofasico' ? 'monofasica' : 'trifasica';
          setRespuestaPregunta('tipoInstalacion', tipoInstalacionDetectado);
          
          // Continuar con la validación como si hubiera seleccionado el tipo manualmente
          // (el resto del flujo se ejecutará según el tipo detectado)
          showToast(`Continuando con instalación ${tipoDetectado === 'monofasico' ? 'monofásica' : 'trifásica'} según análisis de IA`, 'success');
          
          // NO hacer return aquí - dejar que continúe con el flujo normal
        }
        
      } else if (fotoDisyuntor && analisisIA && analisisIA.procesando) {
        // Análisis en progreso
        showToast('El análisis de IA está en progreso. Por favor espera...', 'warning');
        setLoading(false);
        return;
        
      } else {
        // No hay foto - contactar asesor directamente
        try {
          const datosCompletos = {
            propuestaId: form.propuestaId || '', // ID global principal
            contactId: form.comunero?.id || '',
            email: form.comunero?.email || '',
            
            tieneInstalacionFV: false,
            tipoInstalacion: 'desconozco',
            tipoCuadroElectrico: 'ninguno',
            requiereContactoManual: true,
            
            nombre: form.comunero?.nombre || '',
            telefono: form.comunero?.telefono || '',
            direccion: form.comunero?.direccion || '',
            ciudad: form.comunero?.ciudad || '',
            provincia: form.comunero?.provincia || '',
            codigoPostal: form.comunero?.codigoPostal || '',
            
            token: form.token || '',
            dealId: form.dealId || '', // Mantener por compatibilidad
            enZona: form.enZona || 'outZone'
          };

          console.log('📤 Sin foto - Enviando solicitud de contacto manual:', datosCompletos);

          const response = await bateriaService.contactarAsesorDesconoceUnidad(datosCompletos);
          
          if (response.success) {
            showToast('¡Gracias por tu solicitud! Un asesor especializado se pondrá en contacto contigo muy pronto para ayudarte con tu propuesta personalizada.', 'success');
            
            navigate('/gracias-contacto', { 
              state: { 
                motivo: 'desconoce-unidad',
                conIA: false,
                mensaje: 'Hemos recibido tu solicitud. Un especialista en baterías evaluará tu caso específico y te contactará tan pronto como sea posible para ofrecerte la propuesta perfecta que se adapte a tus necesidades.'
              } 
            });
          } else {
            throw new Error(response.error || 'Error al crear la solicitud');
          }
          
          return;
          
        } catch (error) {
          console.error('Error al crear solicitud de contacto manual:', error);
          showToast('Error al registrar la información', 'error');
          setLoading(false);
          return;
        }
      }
    }
    
    // Si está en zona (inZone) y puede instalar dentro de 10m
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && 
        tieneBaterias === false && instalacionCerca10m === true && form.enZona === 'inZone') {
      try {
        // Preparar datos para el endpoint específico de instalación dentro de 10m
        const datosCompletos = {
          // Datos principales requeridos
          contactId: form.comunero?.id || '',
          email: form.comunero?.email || '',
          dealId: form.dealId || '',
          
          // Datos de preguntas adicionales
          tieneInstalacionFV: false,
          tipoInstalacion: tipoInstalacion,
          tieneBaterias: false,
          instalacionCerca10m: true,
          
          // Estado FSM para transición a negociación
          fsmState: FSM_STATES.CALC_TO_NEGOCIACION,
          
          // Datos adicionales del usuario para contexto
          nombre: form.comunero?.nombre || '',
          telefono: form.comunero?.telefono || '',
          direccion: form.comunero?.direccion || '',
          ciudad: form.comunero?.ciudad || '',
          provincia: form.comunero?.provincia || '',
          codigoPostal: form.comunero?.codigoPostal || '',
          
          // Datos de validación
          token: form.token || '',
          propuestaId: form.propuestaId || '',
          enZona: form.enZona || 'inZone'
        };
        
        console.log('📤 Enviando solicitud para instalación dentro de 10m (inZone):', {
          endpoint: '/baterias/comunero/in-zone-no-cost/dentro-10m/1/EFW-5FVM',
          datos: datosCompletos
        });

        // Llamada al endpoint específico
        const response = await bateriaService.solicitudInZoneDentro10m(datosCompletos);
        
        if (response.success) {
          console.log('✅ Solicitud dentro de 10m procesada:', response.data);
          
          // Actualizar el estado FSM en el store
          setFsmState(FSM_STATES.CALC_TO_NEGOCIACION);
          
          showToast('¡Propuesta generada correctamente!', 'success');
          
          // Redirigir a la página de propuesta con los datos
          navigate('/propuesta', { 
            state: { 
              propuestaData: response.data,
              tipoSolicitud: 'dentro-10m'
            } 
          });
        } else {
          throw new Error(response.error || 'Error al procesar la solicitud');
        }
        
        return;
        
      } catch (error) {
        console.error('Error al procesar solicitud dentro de 10m:', error);
        showToast('Error al generar la propuesta', 'error');
        setLoading(false);
        return;
      }
    }
    
    try {
      // Preparar datos completos para el backend
      const datosCompletos = {
        // Datos del usuario del store
        usuarioId: form.comunero?.id || '',
        nombre: form.comunero?.nombre || '',
        email: form.comunero?.email || '',
        telefono: form.comunero?.telefono || '',
        direccion: form.comunero?.direccion || '',
        ciudad: form.comunero?.ciudad || '',
        provincia: form.comunero?.provincia || '',
        codigoPostal: form.comunero?.codigoPostal || '',
        // Datos técnicos del formulario
        tieneInstalacionFV,
        ...(tieneInstalacionFV ? { 
          tieneInversorHuawei,
          ...(tieneInversorHuawei === 'si' ? { 
            tipoInversorHuawei,
            ...(tipoInversorHuawei === 'desconozco' ? { fotoInversor: fotoInversor?.name } : {})
          } : {}),
          ...(tieneInversorHuawei === 'desconozco' ? { fotoInversor: fotoInversor?.name } : {})
        } : { 
          tipoInstalacion,
          ...(tipoInstalacion === 'desconozco' ? { tipoCuadroElectrico } : {}),
          // Si conoce el tipo de instalación (monofásica/trifásica), incluir datos de baterías
          ...((tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') ? {
            tieneBaterias,
            ...(tieneBaterias === true ? { 
              tipoBaterias,
              ...(tipoBaterias === 'canadian' ? { capacidadCanadian } : {}),
              ...(tipoBaterias === 'huawei' ? { capacidadHuawei } : {})
            } : {})
          } : {})
        }),
        requiereContactoManual: false,
        // Datos de validación del store
        token: form.token || '',
        propuestaId: form.propuestaId || '',
        enZona: form.enZona || 'inZone'
      };

      // Llamada real al endpoint /baterias/crea
      const response = await bateriaService.crearSolicitud(datosCompletos);
      
      if (response.success) {
        console.log('Datos adicionales enviados:', response.data);
        showToast('¡Información guardada correctamente!', 'success');
        
        // Redirigir a la página de propuesta o dashboard
        navigate('/propuesta');
      } else {
        throw new Error(response.error || 'Error al guardar la información');
      }
      
    } catch (error) {
      console.error('Error al enviar datos adicionales:', error);
      showToast('Error al guardar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInstalacionChange = (valor: boolean) => {
    setRespuestaPregunta('tieneInstalacionFV', valor);
    // Reset dependent fields
    setRespuestaPregunta('tieneInversorHuawei', '');
    setRespuestaPregunta('tipoInversorHuawei', '');
    setRespuestaPregunta('fotoInversor', null);
    setRespuestaPregunta('tipoInstalacion', '');
    setRespuestaPregunta('tipoCuadroElectrico', '');
    setRespuestaPregunta('tieneBaterias', null);
    setRespuestaPregunta('tipoBaterias', '');
    setRespuestaPregunta('capacidadCanadian', '');
    setRespuestaPregunta('capacidadHuawei', '');
    setRespuestaPregunta('instalacionCerca10m', null);
  };

  const handleHuaweiChange = (valor: string) => {
    setRespuestaPregunta('tieneInversorHuawei', valor);
    // Reset dependent fields
    setRespuestaPregunta('tipoInversorHuawei', '');
    setRespuestaPregunta('fotoInversor', null);
  };

  const handleTipoInversorChange = (valor: string) => {
    setRespuestaPregunta('tipoInversorHuawei', valor);
    if (valor !== 'desconozco') {
      setRespuestaPregunta('fotoInversor', null);
    }
  };

  const handleTipoInstalacionChange = (valor: string) => {
    setRespuestaPregunta('tipoInstalacion', valor);
    if (valor !== 'desconozco') {
      setRespuestaPregunta('tipoCuadroElectrico', '');
    }
    // Reset battery related fields
    setRespuestaPregunta('tieneBaterias', null);
    setRespuestaPregunta('tipoBaterias', '');
    setRespuestaPregunta('capacidadCanadian', '');
    setRespuestaPregunta('capacidadHuawei', '');
    setRespuestaPregunta('instalacionCerca10m', null);
  };

  const handleTieneBateriasChange = (valor: boolean) => {
    setRespuestaPregunta('tieneBaterias', valor);
    // Reset dependent fields
    setRespuestaPregunta('tipoBaterias', '');
    setRespuestaPregunta('capacidadCanadian', '');
    setRespuestaPregunta('capacidadHuawei', '');
  };

  const handleTipoBateriasChange = (valor: string) => {
    setRespuestaPregunta('tipoBaterias', valor);
    // Reset capacity fields
    setRespuestaPregunta('capacidadCanadian', '');
    setRespuestaPregunta('capacidadHuawei', '');
  };

  const handleInstalacionCerca10mChange = (valor: boolean) => {
    setRespuestaPregunta('instalacionCerca10m', valor);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea imagen
      if (file.type.startsWith('image/')) {
        setRespuestaPregunta('fotoInversor', file);
      } else {
        showToast('Por favor selecciona una imagen válida', 'error');
        e.target.value = '';
      }
    }
  };

  const handleDisyuntorFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea imagen
      if (file.type.startsWith('image/')) {
        // Guardar archivo en el store
        setRespuestaPregunta('fotoDisyuntor', file);
        
        // Iniciar análisis de IA
        setRespuestaPregunta('analisisIA', {
          tipoDetectado: 'desconocido',
          procesando: true,
          mensaje: 'Analizando imagen...'
        });
        
        showToast('Foto cargada. Analizando con IA...', 'info');
        
        try {
          // Preparar datos para el análisis
          const analisisData = {
            contactId: form.comunero?.id || '',
            email: form.comunero?.email || '',
            dealId: form.dealId || '',
            fotoDisyuntor: file,
            nombre: form.comunero?.nombre || '',
            telefono: form.comunero?.telefono || '',
            token: form.token || '',
            propuestaId: form.propuestaId || ''
          };
          
          console.log('🤖 Enviando foto para análisis de IA:', {
            archivo: file.name,
            tamano: file.size,
            tipo: file.type
          });
          
          // Llamar al servicio de análisis de IA
          const response = await bateriaService.analizarFotoDisyuntor(analisisData);
          
          if (response.success && response.data && response.data.analisisDisyuntor) {
            const { tipoInstalacion, descripcion, confianza } = response.data.analisisDisyuntor;
            
            // Convertir el tipo de instalación del backend al formato del frontend
            const tipoDetectado = tipoInstalacion.toLowerCase() === 'monofasico' ? 'monofasico' : 
                                 tipoInstalacion.toLowerCase() === 'trifasico' ? 'trifasico' : 'desconocido';
            
            // Actualizar el store con el resultado
            setRespuestaPregunta('analisisIA', {
              tipoDetectado,
              confianza: confianza === 'alta' ? 0.9 : confianza === 'media' ? 0.7 : 0.5,
              mensaje: descripcion,
              procesando: false
            });
            
            console.log('✅ Análisis de IA completado:', {
              tipoDetectado,
              confianza,
              descripcion
            });
            
            // Mostrar resultado según el tipo detectado
            if (tipoDetectado === 'desconocido') {
              showToast('No se pudo identificar el tipo de cuadro eléctrico. Un asesor se pondrá en contacto contigo.', 'warning');
            } else {
              const tipoTexto = tipoDetectado === 'monofasico' ? 'monofásico' : 'trifásico';
              showToast(`¡Excelente! Se detectó un cuadro eléctrico ${tipoTexto}. Continuaremos con tu propuesta.`, 'success');
              
              // Mostrar descripción detallada de la IA en un toast largo
              if (descripcion) {
                setTimeout(() => {
                  showToast(`🤖 Análisis de IA: ${descripcion}`, 'info', 20000);
                }, 1000); // Delay de 1 segundo para que se vea después del primer toast
              }
              
              // Autoseleccionar el tipo de instalación según el análisis
              setRespuestaPregunta('tipoInstalacion', tipoDetectado === 'monofasico' ? 'monofasica' : 'trifasica');
            }
            
          } else {
            // Error en el análisis
            setRespuestaPregunta('analisisIA', {
              tipoDetectado: 'desconocido',
              procesando: false,
              mensaje: response.error || 'Error en el análisis'
            });
            
            showToast(`Error en el análisis: ${response.error || 'No se pudo procesar la imagen'}`, 'error');
          }
          
        } catch (error) {
          console.error('Error en análisis de IA:', error);
          
          setRespuestaPregunta('analisisIA', {
            tipoDetectado: 'desconocido',
            procesando: false,
            mensaje: 'Error al conectar con el servicio de análisis'
          });
          
          showToast('Error al procesar la imagen. Inténtalo de nuevo.', 'error');
        }
        
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
                  onChange={(e) => handleTipoInstalacionChange(e.target.value)}
                  required
                >
                  <option value="">Selecciona el tipo de instalación</option>
                  <option value="trifasica">Trifásica</option>
                  <option value="monofasica">Monofásica</option>
                  <option value="desconozco">Lo desconozco</option>
                </select>
              </div>
            )}

            {/* Si NO tiene instalación FV y conoce el tipo (monofásica/trifásica) - Pregunta sobre baterías */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Tienes ya baterías instaladas? <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tieneBaterias"
                      id="bateriasSi"
                      checked={tieneBaterias === true}
                      onChange={() => handleTieneBateriasChange(true)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="bateriasSi">
                      Sí
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tieneBaterias"
                      id="bateriasNo"
                      checked={tieneBaterias === false}
                      onChange={() => handleTieneBateriasChange(false)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="bateriasNo">
                      No
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Si tiene baterías instaladas - Tipo de baterías */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Qué baterías tienes instaladas? <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={tipoBaterias}
                  onChange={(e) => handleTipoBateriasChange(e.target.value)}
                  required
                >
                  <option value="">Selecciona el tipo de batería</option>
                  <option value="canadian">CANADIAN</option>
                  <option value="huawei">HUAWEI</option>
                  <option value="otra">OTRA O LO DESCONOZCO</option>
                </select>
              </div>
            )}

            {/* Si seleccionó CANADIAN - Pregunta capacidad */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && tipoBaterias === 'canadian' && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Qué capacidad tienes instalada? <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={capacidadCanadian}
                  onChange={(e) => setRespuestaPregunta('capacidadCanadian', e.target.value)}
                  required
                >
                  <option value="">Selecciona la capacidad</option>
                  <option value="6.6kw">6,6 kW</option>
                  <option value="9.9kw">9,9 kW</option>
                  <option value="13.2kw">13,2 kW</option>
                  <option value="16.5kw">16,5 kW</option>
                  <option value="19.8kw">19,8 kW</option>
                </select>
              </div>
            )}

            {/* Si seleccionó HUAWEI - Pregunta capacidad */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && tipoBaterias === 'huawei' && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Qué capacidad tienes instalada? <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  value={capacidadHuawei}
                  onChange={(e) => setRespuestaPregunta('capacidadHuawei', e.target.value)}
                  required
                >
                  <option value="">Selecciona la capacidad</option>
                  <option value="5kw">5kW</option>
                  <option value="10kw">10kW</option>
                  <option value="15kw">15kW</option>
                </select>
              </div>
            )}

            {/* Si seleccionó OTRA O LO DESCONOZCO - Mensaje informativo */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && tipoBaterias === 'otra' && (
              <div className="fade-in-result">
                <div className="alert alert-info border-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">ℹ️</span>
                    <small>
                      <strong>Perfecto.</strong> Un especialista revisará tu caso específico para ofrecerte la mejor propuesta.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Si SÍ tiene baterías instaladas - Mensaje informativo */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === true && (
              <div className="fade-in-result">
                <div className="alert alert-info border-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">ℹ️</span>
                    <small>
                      <strong>Perfecto.</strong> Continuaremos con tu propuesta personalizada de baterías.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Pregunta sobre distancia de instalación - solo si NO tiene baterías */}
            {tieneInstalacionFV === false && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === false && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Podríamos realizar la instalación a menos de 10m del cuadro eléctrico? <span className="text-danger">*</span>
                </label>
                
                <div className="d-flex gap-3 mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="instalacionCerca10m"
                      id="instalacionCercaSi"
                      checked={instalacionCerca10m === true}
                      onChange={() => handleInstalacionCerca10mChange(true)}
                    />
                    <label className="form-check-label fw-bold text-success" htmlFor="instalacionCercaSi">
                      Sí
                    </label>
                  </div>
                  
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="instalacionCerca10m"
                      id="instalacionCercaNo"
                      checked={instalacionCerca10m === false}
                      onChange={() => handleInstalacionCerca10mChange(false)}
                    />
                    <label className="form-check-label fw-bold text-danger" htmlFor="instalacionCercaNo">
                      No
                    </label>
                  </div>
                </div>

                {/* Mensaje informativo según la respuesta */}
                {instalacionCerca10m === true && (
                  <div className="alert alert-success border-0 fade-in-result">
                    <div className="d-flex align-items-center">
                      <span className="me-2">✅</span>
                      <small>
                        <strong>Excelente.</strong> Puedes hacer clic en el siguiente botón.
                      </small>
                    </div>
                  </div>
                )}
                
                {instalacionCerca10m === false && (
                  <div className="alert alert-warning border-0 fade-in-result">
                    <div className="d-flex align-items-center">
                      <span className="me-2">⚠️</span>
                      <small>
                        <strong>Sin problema.</strong> Evaluaremos las opciones técnicas para la instalación a mayor distancia.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Si NO tiene instalación FV y selecciona "Lo desconozco" - Mostrar fotos de cuadros */}
            {tieneInstalacionFV === false && tipoInstalacion === 'desconozco' && (
              <div className="fade-in-result">
                <label className="form-label h5 fw-bold mb-3">
                  ¿Reconoces alguno de estos tipos de cuadro eléctrico? <span className="text-danger">*</span>
                </label>
                <p className="text-muted mb-4">
                  Por favor, observa las siguientes imágenes e indica si alguna corresponde a tu cuadro eléctrico:
                </p>
                
                <div className="row g-3 mb-4">
                  {/* Cuadro Tipo 1 */}
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tipoCuadro"
                        id="cuadroTipo1"
                        value="tipo1"
                        checked={tipoCuadroElectrico === 'tipo1'}
                        onChange={(e) => setRespuestaPregunta('tipoCuadroElectrico', e.target.value)}
                      />
                      <label className="form-check-label d-block" htmlFor="cuadroTipo1">
                        <div className="border rounded-3 overflow-hidden mb-2" style={{ cursor: 'pointer' }}>
                          <img 
                            src="https://placehold.co/600x400/e3f2fd/1976d2?text=Cuadro+Tipo+1" 
                            alt="Cuadro eléctrico tipo 1" 
                            className="w-100 h-auto"
                          />
                        </div>
                        <strong className="d-block text-center">Tipo 1 - Cuadro Monofásico</strong>
                      </label>
                    </div>
                  </div>

                  {/* Cuadro Tipo 2 */}
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tipoCuadro"
                        id="cuadroTipo2"
                        value="tipo2"
                        checked={tipoCuadroElectrico === 'tipo2'}
                        onChange={(e) => setRespuestaPregunta('tipoCuadroElectrico', e.target.value)}
                      />
                      <label className="form-check-label d-block" htmlFor="cuadroTipo2">
                        <div className="border rounded-3 overflow-hidden mb-2" style={{ cursor: 'pointer' }}>
                          <img 
                            src="https://placehold.co/600x400/f3e5f5/7b1fa2?text=Cuadro+Tipo+2" 
                            alt="Cuadro eléctrico tipo 2" 
                            className="w-100 h-auto"
                          />
                        </div>
                        <strong className="d-block text-center">Tipo 2 - Cuadro Trifásico</strong>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Opción "Ninguno coincide" */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="tipoCuadro"
                    id="cuadroNinguno"
                    value="ninguno"
                    checked={tipoCuadroElectrico === 'ninguno'}
                    onChange={(e) => setRespuestaPregunta('tipoCuadroElectrico', e.target.value)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="cuadroNinguno">
                    Ninguno de los anteriores coincide con mi cuadro eléctrico
                  </label>
                </div>

                {/* Opción de subir foto si selecciona "ninguno" */}
                {tipoCuadroElectrico === 'ninguno' && (
                  <div className="mt-4">
                   
                    
                    {/* Sección opcional para subir foto */}
                    <div className="border rounded-3 p-4 bg-light">
                      <h6 className="fw-bold mb-3">
                        <span className="me-2">🤖</span>
                        ¿Quieres acelerar el proceso?
                      </h6>
                      <p className="text-muted mb-3 small">
                        Puedes subir una foto de tu disyuntor para que nuestra IA la analice y te demos una respuesta más rápida.
                      </p>
                      
                      <div className="mb-3">
                        <label htmlFor="fotoDisyuntor" className="form-label fw-semibold">
                          Foto del disyuntor (opcional)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="fotoDisyuntor"
                          accept="image/*"
                          onChange={handleDisyuntorFileChange}
                        />
                        <div className="form-text">
                          <small className="text-muted">
                            📸 Toma una foto clara de tu cuadro eléctrico principal donde esté el disyuntor general
                          </small>
                        </div>
                      </div>
                      
                      {fotoDisyuntor && (
                        <div className="alert alert-success border-0 fade-in-result">
                          <div className="d-flex align-items-center">
                            <span className="me-2">✅</span>
                            <small>
                              <strong>Foto cargada:</strong> {fotoDisyuntor.name}
                            </small>
                          </div>
                        </div>
                      )}

                      {/* Indicador de procesamiento */}
                      {analisisIA && analisisIA.procesando && (
                        <div className="alert alert-info border-0 fade-in-result">
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Analizando...</span>
                            </div>
                            <small>
                              <strong>Analizando foto...</strong> Nuestra IA está procesando tu imagen
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón enviar */}
            <div className="d-grid gap-2 mt-4">
              {/* Si selecciona "ninguno" de los cuadros, mostrar botón diferente */}
              {(!tieneInstalacionFV && tipoInstalacion === 'desconozco' && tipoCuadroElectrico === 'ninguno') ? (
                <button
                  type="submit"
                  className="btn btn-warning btn-lg fw-bold button-hover-result"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  {loading ? 'Registrando...' : 'Prefiero que me contacte un asesor'}
                </button>
              ) : (
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
              )}
              
              <small className="text-muted text-center">
                {(!tieneInstalacionFV && tipoInstalacion === 'desconozco' && tipoCuadroElectrico === 'ninguno') 
                  ? 'Un especialista evaluará tu caso específico y te contactará pronto'
                  : 'Esta información nos ayudará a crear una propuesta personalizada para ti'
                }
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
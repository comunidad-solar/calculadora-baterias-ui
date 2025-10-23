import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { bateriaService, comuneroService, nuevoComuneroService } from '../services/apiService';
import { useFormStore } from '../zustand/formStore';
import PageTransition from './PageTransition';
import GoogleAddressInput from './GoogleAddressInput';
import ejemploCuadroMonofasico from '../assets/Ejemplo_Cuadro_Monofasico.png';
import ejemploCuadroTrifasico from '../assets/Ejemplo_Cuadro_Trifasico.png';

const PreguntasAdicionales = () => {
  const [loading, setLoading] = useState(false);
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [loadingDatosActualizados, setLoadingDatosActualizados] = useState(false);
  const [showAnalisisModal, setShowAnalisisModal] = useState(false);
  const [analisisModalContent, setAnalisisModalContent] = useState('');
  
  const [infoEditada, setInfoEditada] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: ''
  });

  // Helper function para obtener parámetros UTM del store
  const getUTMParams = () => ({
    utm_source: form.utm_source || '',
    utm_medium: form.utm_medium || '',
    utm_campaign: form.utm_campaign || '',
    utm_term: form.utm_term || '',
    utm_content: form.utm_content || '',
    // Campos legacy mantenidos para compatibilidad
    campaignSource: form.campaignSource || '',
    utm: form.utm || '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  // Usar formStore principal para persistir datos con Redux DevTools
  const { 
    form, 
    setRespuestaPregunta, 
    setFsmState,
    setField
  } = useFormStore();
  
  // Log para debugging - verificar datos disponibles al cargar el componente
  useEffect(() => {
    console.log('🔍 Estado del store al cargar PreguntasAdicionales:', {
      comunero: form.comunero,
      token: form.token,
      propuestaId: form.propuestaId,
      enZona: form.enZona,
      fsmState: form.fsmState,
      fromAsesoresDeal: form.fromAsesoresDeal,
      asesores: form.asesores,
      dealId: form.dealId,
      fullForm: form
    });

    // Verificar si venimos de un deal de asesores
    const fromAsesoresDeal = form.fromAsesoresDeal || 
                            sessionStorage.getItem('fromAsesoresDeal') === 'true' ||
                            location.state?.fromAsesoresDeal;
    
    if (fromAsesoresDeal && form.asesores) {
      console.log('🎯 Cargando desde deal de asesores con datos prellenados');
      console.log('📊 Respuestas de preguntas desde deal:', form.respuestasPreguntas);
      
      // Si hay datos del comunero y no se ha inicializado la info editada, inicializarla
      if (form.comunero && !infoEditada.nombre) {
        setInfoEditada({
          nombre: form.comunero.nombre || '',
          telefono: form.comunero.telefono || '',
          direccion: form.comunero.direccion || '',
          codigoPostal: form.comunero.codigoPostal || '',
          ciudad: form.comunero.ciudad || '',
          provincia: form.comunero.provincia || ''
        });
      }
    }
  }, [form, location.state, infoEditada.nombre]);

  // Protección para usuarios outZone - redirigir a página específica
  useEffect(() => {
    if (form.enZona === 'outZone') {
      console.log('🚫 Usuario outZone detectado en PreguntasAdicionales, redirigiendo a página fuera de zona');
      navigate('/fuera-de-zona', { replace: true });
      return;
    }
  }, [form.enZona, navigate]);
  
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
    instalacionCerca10m = null,
    metrosExtra = ''
  } = form.respuestasPreguntas || {};

  // Verificar si tenemos código postal para habilitar las preguntas
  const comuneroActual = form.comunero;
  const codigoPostalDisponible = !!(form.codigoPostal || comuneroActual?.codigoPostal);
  
  console.log('🔍 Estado código postal:', {
    codigoPostalForm: form.codigoPostal,
    codigoPostalComunero: comuneroActual?.codigoPostal,
    codigoPostalDisponible
  });

  // Efecto para buscar datos actualizados si viene del flujo de validar-codigo
  useEffect(() => {
    const buscarDatosActualizados = async () => {
      // Verificar si viene del flujo de validar-codigo
      const vieneDeValidarCodigo = location.state?.fromValidarCodigo || 
                                   sessionStorage.getItem('fromValidarCodigo') === 'true';
      
      // Verificar si ya hicimos esta llamada para evitar repeticiones
      const yaHizoLlamada = sessionStorage.getItem('datosActualizadosObtenidos') === 'true';
      
      if (!vieneDeValidarCodigo || !form.propuestaId || yaHizoLlamada) {
        console.log('🚫 Saltando obtenerDatosActualizados:', {
          vieneDeValidarCodigo,
          propuestaId: !!form.propuestaId,
          yaHizoLlamada
        });
        return;
      }

      console.log('🔄 Detectado flujo desde validar-codigo, buscando datos actualizados...');
      
      // Iniciar loading inmediatamente
      setLoadingDatosActualizados(true);
      
      // Marcar que ya hicimos esta llamada para evitar repeticiones
      sessionStorage.setItem('datosActualizadosObtenidos', 'true');
      
      // Limpiar el flag para evitar llamadas repetidas
      sessionStorage.removeItem('fromValidarCodigo');
      
      // Esperar 3 segundos antes de hacer la llamada
      setTimeout(async () => {
        try {
          if (!form.propuestaId) {
            console.warn('⚠️ No hay propuestaId disponible');
            return;
          }
          
          console.log('📡 Llamando al endpoint de datos actualizados para propuesta:', form.propuestaId);
          
          const response = await nuevoComuneroService.obtenerDatosActualizadosPostValidacion(form.propuestaId);
          
          if (response.success && response.data) {
            const { comuneroActualizado, fuenteDatos } = response.data;
            
            if (fuenteDatos === 'base_datos') {
              console.log('✅ Datos actualizados encontrados:', response.data);
              
              let datosActualizados = false;
              
              // Actualizar datos del comunero si están disponibles
              if (comuneroActualizado && Object.keys(comuneroActualizado).length > 0) {
                const datosLimpiosComunero: Partial<typeof comuneroActualizado> = {};
                
                // Verificar cada campo del comunero específicamente
                if (comuneroActualizado.nombre && comuneroActualizado.nombre.trim() !== '') {
                  datosLimpiosComunero.nombre = comuneroActualizado.nombre.trim();
                }
                if (comuneroActualizado.telefono && comuneroActualizado.telefono.trim() !== '') {
                  datosLimpiosComunero.telefono = comuneroActualizado.telefono.trim();
                }
                if (comuneroActualizado.direccion && comuneroActualizado.direccion.trim() !== '') {
                  datosLimpiosComunero.direccion = comuneroActualizado.direccion.trim();
                }
                if (comuneroActualizado.codigoPostal && comuneroActualizado.codigoPostal.trim() !== '') {
                  datosLimpiosComunero.codigoPostal = comuneroActualizado.codigoPostal.trim();
                }
                if (comuneroActualizado.ciudad && comuneroActualizado.ciudad.trim() !== '') {
                  datosLimpiosComunero.ciudad = comuneroActualizado.ciudad.trim();
                }
                if (comuneroActualizado.provincia && comuneroActualizado.provincia.trim() !== '') {
                  datosLimpiosComunero.provincia = comuneroActualizado.provincia.trim();
                }
                
                // Actualizar datos del comunero si hay cambios válidos
                if (Object.keys(datosLimpiosComunero).length > 0) {
                  setField('comunero', {
                    ...form.comunero,
                    ...datosLimpiosComunero
                  });
                  datosActualizados = true;
                  console.log('📋 Datos del comunero actualizados:', datosLimpiosComunero);
                }
                
                // Actualizar zona si viene en comuneroActualizado y es diferente
                if (comuneroActualizado.enZona && comuneroActualizado.enZona !== form.enZona) {
                  setField('enZona', comuneroActualizado.enZona);
                  datosActualizados = true;
                  console.log('🗺️ Zona actualizada:', { anterior: form.enZona, nueva: comuneroActualizado.enZona });
                }
                
                // Actualizar campaignSource si viene en comuneroActualizado
                if (comuneroActualizado.campaignSource && comuneroActualizado.campaignSource.trim() !== '') {
                  setField('campaignSource', comuneroActualizado.campaignSource.trim());
                  datosActualizados = true;
                  console.log('📢 Campaign source actualizado:', comuneroActualizado.campaignSource);
                }
                
                // Actualizar fsmState si viene en comuneroActualizado y es diferente
                if (comuneroActualizado.fsmState && comuneroActualizado.fsmState !== form.fsmState) {
                  setField('fsmState', comuneroActualizado.fsmState);
                  datosActualizados = true;
                  console.log('🔄 FSM State actualizado:', { anterior: form.fsmState, nuevo: comuneroActualizado.fsmState });
                }
              }
              
              // Mostrar toast solo si realmente se actualizó algún dato
              if (datosActualizados) {
                showToast('Información actualizada desde la base de datos', 'success');
                console.log('✅ Datos actualizados aplicados en el store');
              } else {
                console.log('ℹ️ No hay datos válidos para actualizar, manteniendo información existente');
              }
              
            } else {
              console.log('ℹ️ No se encontraron datos más recientes, manteniendo información del proceso de validar-codigo');
            }
          } else {
            console.log('ℹ️ Backend no devolvió información, manteniendo datos existentes del proceso de validar-codigo');
          }
        } catch (error) {
          console.error('❌ Error al buscar datos actualizados:', error);
          console.log('ℹ️ Manteniendo información existente del proceso de validar-codigo debido a error en la consulta');
        } finally {
          setLoadingDatosActualizados(false);
          
          // Validar después de la llamada si tenemos código postal
          setTimeout(() => {
            const comuneroActual = form.comunero;
            const codigoPostalActual = form.codigoPostal || comuneroActual?.codigoPostal;
            
            console.log('🔍 Validando código postal después de datos actualizados:', {
              codigoPostalForm: form.codigoPostal,
              codigoPostalComunero: comuneroActual?.codigoPostal,
              codigoPostalFinal: codigoPostalActual
            });
            
            // Si no tenemos código postal, activar modo edición automáticamente
            if (!codigoPostalActual || codigoPostalActual.trim() === '') {
              console.log('⚠️ No se encontró código postal, activando modo edición para que el usuario complete la información');
              
              // Usar iniciarEdicion() para prellenar datos correctamente
              if (form.comunero) {
                setInfoEditada({
                  nombre: form.comunero.nombre || '',
                  telefono: form.comunero.telefono || '',
                  direccion: form.comunero.direccion || '',
                  codigoPostal: form.comunero.codigoPostal || form.codigoPostal || '',
                  ciudad: form.comunero.ciudad || form.ciudad || '',
                  provincia: form.comunero.provincia || form.provincia || ''
                });
                setEditandoInfo(true);
              }
              
              showToast('Por favor, completa tu dirección con código postal para continuar', 'warning');
            } else {
              console.log('✅ Código postal disponible, continuando con el flujo normal');
            }
          }, 500); // Pequeño delay para asegurar que los datos estén actualizados
        }
      }, 3000);
    };

    buscarDatosActualizados();
  }, [form.propuestaId, location.state, setField, setLoadingDatosActualizados, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar código postal primero
    if (!codigoPostalDisponible) {
      showToast('Por favor completa tu dirección con código postal antes de continuar', 'error');
      setLoading(false);
      return;
    }

    // Validaciones
    if (tieneInstalacionFV === null) {
      showToast('Por favor indica si tienes instalación fotovoltaica', 'error');
      setLoading(false);
      return;
    }

    // Si tiene instalación FV, ir directamente a contactar asesor (sin validaciones adicionales)
    if (tieneInstalacionFV === true) {
      // Proceder directamente con el flujo de contactar asesor
      try {
        const datosCompletos = {
          propuestaId: form.propuestaId || '',
          contactId: form.comunero?.id || '',
          email: form.comunero?.email || form.mail || '',
          
          tieneInstalacionFV: true,
          requiereContactoManual: true,
          
          nombre: form.comunero?.nombre || form.nombre || '',
          telefono: form.comunero?.telefono || form.telefono || '',
          direccion: form.comunero?.direccion || form.direccion || '',
          ciudad: form.comunero?.ciudad || form.ciudad || '',
          provincia: form.comunero?.provincia || form.provincia || '',
          codigoPostal: form.comunero?.codigoPostal || form.codigoPostal || '',
          
          // Parámetros UTM
          ...getUTMParams(),
          
          token: form.token || '',
          dealId: form.dealId || '',
          mpkLogId: form.mpkLogId || '',
          enZona: form.enZona || 'inZone',
          fsmState: form.fsmState || 'INITIAL'
        };

        console.log('📞 Contactando asesor para usuario con instalación FV:', datosCompletos);
        const response = await bateriaService.contactarAsesorDesconoceUnidad(datosCompletos);
        
        if (response.success) {
          showToast('¡Perfecto! Un asesor se pondrá en contacto contigo pronto para evaluar tu instalación fotovoltaica.', 'success');
          navigate('/gracias-contacto');
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('❌ Error contactando asesor:', error);
        showToast('Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.', 'error');
      }
      setLoading(false);
      return;
    }

    // Validaciones para usuarios SIN instalación fotovoltaica (flujo normal)
    // (Las validaciones del inversor Huawei han sido eliminadas ya que solo aplican para quienes ya tienen instalación FV)

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

    // Si respondió NO a los 10m, validar metros extra
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && tieneBaterias === false && instalacionCerca10m === false && !metrosExtra) {
      showToast('Por favor indica cuántos metros extra necesitaríamos', 'error');
      setLoading(false);
      return;
    }

    // Si no tiene instalación FV y desconoce el tipo, validar cuadro eléctrico
    if (!tieneInstalacionFV && tipoInstalacion === 'desconozco' && !tipoCuadroElectrico) {
      showToast('Por favor identifica el tipo de cuadro eléctrico o confirma que lo desconoces', 'error');
      setLoading(false);
      return;
    }

    // Si requiere contacto con asesor por tipo de baterías "OTRA O LO DESCONOZCO"
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && 
        tieneBaterias === true && tipoBaterias === 'otra') {
      try {
        const datosCompletos = {
          propuestaId: form.propuestaId || '',
          contactId: form.comunero?.id || '',
          email: form.comunero?.email || '',
          
          tieneInstalacionFV: false,
          tipoInstalacion: tipoInstalacion,
          tieneBaterias: true,
          tipoBaterias: 'otra',
          requiereContactoManual: true,
          
          // Parámetros UTM
          ...getUTMParams(),
          
          nombre: form.comunero?.nombre || '',
          telefono: form.comunero?.telefono || '',
          direccion: form.comunero?.direccion || '',
          ciudad: form.comunero?.ciudad || '',
          provincia: form.comunero?.provincia || '',
          codigoPostal: form.comunero?.codigoPostal || '',
          
          token: form.token || '',
          dealId: form.dealId || '',
          enZona: form.enZona || 'outZone'
        };

        console.log('📤 Tipo de baterías "OTRA" requiere asesor - Enviando solicitud de contacto:', datosCompletos);

        const response = await bateriaService.contactarAsesorDesconoceUnidad(datosCompletos);
        
        if (response.success) {
          showToast('¡Gracias por tu solicitud! Un especialista evaluará tu instalación actual de baterías y se contactará contigo para ofrecerte la mejor propuesta de ampliación.', 'success');
          
          navigate('/gracias-contacto', { 
            state: { 
              motivo: 'tipo-baterias-otra',
              tipoBaterias: 'otra'
            }
          });
        } else {
          throw new Error(response.error || 'Error al enviar la solicitud');
        }
      } catch (error) {
        console.error('Error al contactar asesor por tipo de baterías:', error);
        showToast('Error al enviar la solicitud', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Si requiere contacto con asesor por metros extra
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && 
        tieneBaterias === false && instalacionCerca10m === false && 
        (metrosExtra === 'más de 15m' || metrosExtra === 'lo desconoce' || metrosExtra === 'prefiero hablar con un asesor')) {
      try {
        const datosCompletos = {
          propuestaId: form.propuestaId || '',
          contactId: form.comunero?.id || '',
          email: form.comunero?.email || '',
          
          tieneInstalacionFV: false,
          tipoInstalacion: tipoInstalacion,
          tieneBaterias: false,
          instalacionCerca10m: false,
          metrosExtra: metrosExtra,
          requiereContactoManual: true,
          
          nombre: form.comunero?.nombre || '',
          telefono: form.comunero?.telefono || '',
          direccion: form.comunero?.direccion || '',
          ciudad: form.comunero?.ciudad || '',
          provincia: form.comunero?.provincia || '',
          codigoPostal: form.comunero?.codigoPostal || '',
          
          // Parámetros UTM
          ...getUTMParams(),
          
          token: form.token || '',
          dealId: form.dealId || '',
          enZona: form.enZona || 'outZone'
        };

        console.log('📤 Metros extra requiere asesor - Enviando solicitud de contacto:', datosCompletos);

        const response = await bateriaService.contactarAsesorDesconoceUnidad(datosCompletos);
        
        if (response.success) {
          showToast('¡Gracias por tu solicitud! Un especialista técnico evaluará tu caso y se contactará contigo pronto para coordinar la instalación.', 'success');
          
          navigate('/gracias-contacto', { 
            state: { 
              motivo: 'metros-extra-asesor',
              metrosExtra: metrosExtra
            }
          });
        } else {
          throw new Error(response.error || 'Error al enviar la solicitud');
        }
      } catch (error) {
        console.error('Error al contactar asesor por metros extra:', error);
        showToast('Error al enviar la solicitud', 'error');
      } finally {
        setLoading(false);
      }
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
              
              // Parámetros UTM
              ...getUTMParams(),
              
              token: form.token || '',
              dealId: form.dealId || '', // Mantener por compatibilidad
              enZona: form.enZona || 'outZone',
              fsmState: '03_DESCONOCE_TENSION'
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
            
            // Parámetros UTM
            ...getUTMParams(),
            
            token: form.token || '',
            dealId: form.dealId || '', // Mantener por compatibilidad
            enZona: form.enZona || 'outZone',
            fsmState: '03_DESCONOCE_TENSION'
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
    
    // Si está en zona (inZone, inZoneWithCost o NoCPAvailable) y puede instalar dentro de 10m
    if (!tieneInstalacionFV && (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && 
        tieneBaterias === false && instalacionCerca10m === true && (form.enZona === 'inZone' || form.enZona === 'inZoneWithCost' || form.enZona === 'NoCPAvailable')) {
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
          
          // Estado FSM para datos recogidos
          fsmState: '04_DATOS_RECOGIDOS',
          
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
          datos: datosCompletos
        });

        // Llamada al endpoint específico
        const response = await bateriaService.solicitudInZoneDentro10m(datosCompletos);
        
        if (response.success) {
          console.log('✅ Solicitud dentro de 10m procesada:', response.data);
          
          // Actualizar el estado FSM en el store
          setFsmState('04_DATOS_RECOGIDOS');
          
          showToast('¡Propuesta generada correctamente!', 'success');
          
          // Redirigir a la página de propuesta con los datos
          navigate('/propuesta', { 
            state: { 
              propuestaData: response.data,
              tipoSolicitud: 'dentro-10m',
              tipoInstalacion: tipoInstalacion,
              requiereVisitaTecnica: tipoInstalacion === 'trifasica'
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
        contactId: form.comunero?.id || '',
        nombre: form.comunero?.nombre || '',
        email: form.comunero?.email || '',
        telefono: form.comunero?.telefono || '',
        direccion: form.comunero?.direccion || '',
        ciudad: form.comunero?.ciudad || '',
        provincia: form.comunero?.provincia || '',
        codigoPostal: form.comunero?.codigoPostal || '',
        // Parámetros UTM
        ...getUTMParams(),
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
            } : {
              // Si NO tiene baterías, incluir datos de instalación y metros extra
              instalacionCerca10m,
              ...(instalacionCerca10m === false ? { metrosExtra } : {})
            })
          } : {})
        }),
        requiereContactoManual: false,
        // Datos de validación del store
        token: form.token || '',
        propuestaId: form.propuestaId || '',
        enZona: form.enZona || 'inZone',
        fsmState: '04_DATOS_RECOGIDOS'
      };

      // Llamada real al endpoint /baterias/crea
      const response = await bateriaService.crearSolicitud(datosCompletos);
      
      if (response.success) {
        console.log('Datos adicionales enviados:', response.data);
        showToast('¡Información guardada correctamente!', 'success');
        
        // Actualizar propuestaId en el store si el backend devuelve una nueva/actualizada
        if (response.data?.propuestaId && response.data.propuestaId !== form.propuestaId) {
          console.log('💾 Actualizando propuestaId en store:', response.data.propuestaId);
          setField('propuestaId', response.data.propuestaId);
        }
        
        // Limpiar flags de sesión al completar el proceso exitosamente
        sessionStorage.removeItem('datosActualizadosObtenidos');
        
        // Redirigir a la página de propuesta con los datos recibidos
        navigate('/propuesta', {
          state: { 
            propuestaData: response.data,
            tipoSolicitud: 'formulario-completo',
            tipoInstalacion: tipoInstalacion,
            requiereVisitaTecnica: tipoInstalacion === 'trifasica'
          } 
        });
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

  const handleTipoCuadroElectricoChange = (valor: string) => {
    setRespuestaPregunta('tipoCuadroElectrico', valor);
    
    // Si selecciona tipo1 (monofásico) o tipo2 (trifásico), actualizar automáticamente tipoInstalacion
    if (valor === 'tipo1') {
      setRespuestaPregunta('tipoInstalacion', 'monofasica');
      // Reset battery related fields ya que cambió el tipo de instalación
      setRespuestaPregunta('tieneBaterias', null);
      setRespuestaPregunta('tipoBaterias', '');
      setRespuestaPregunta('capacidadCanadian', '');
      setRespuestaPregunta('capacidadHuawei', '');
      setRespuestaPregunta('instalacionCerca10m', null);
      setRespuestaPregunta('metrosExtra', '');
    } else if (valor === 'tipo2') {
      setRespuestaPregunta('tipoInstalacion', 'trifasica');
      // Reset battery related fields ya que cambió el tipo de instalación
      setRespuestaPregunta('tieneBaterias', null);
      setRespuestaPregunta('tipoBaterias', '');
      setRespuestaPregunta('capacidadCanadian', '');
      setRespuestaPregunta('capacidadHuawei', '');
      setRespuestaPregunta('instalacionCerca10m', null);
      setRespuestaPregunta('metrosExtra', '');
    }
    // Si selecciona 'ninguno', no cambiar tipoInstalacion (se mantiene en 'desconozco')
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
    // Si selecciona "Sí", resetear metros extra
    if (valor === true) {
      setRespuestaPregunta('metrosExtra', '');
    }
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

  // Función helper para determinar si debe contactar un asesor
  const debeContactarAsesor = () => {
    // Caso 0: Si tiene instalación fotovoltaica (respuesta SÍ), debe contactar directamente con asesor
    if (tieneInstalacionFV === true) {
      return true;
    }
    
    // Caso 1: Si seleccionó "ninguno" de los cuadros eléctricos
    if (!tieneInstalacionFV && tipoInstalacion === 'desconozco' && tipoCuadroElectrico === 'ninguno') {
      return true;
    }
    
    // Caso 2: Si respondió NO a los 10m y seleccionó opciones que requieren asesor
    if (!tieneInstalacionFV && 
        (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && 
        tieneBaterias === false && 
        instalacionCerca10m === false &&
        (metrosExtra === 'más de 15m' || metrosExtra === 'lo desconoce' || metrosExtra === 'prefiero hablar con un asesor')) {
      return true;
    }
    
    // Caso 3: Si tiene baterías y seleccionó "OTRA O LO DESCONOZCO"
    if (!tieneInstalacionFV && 
        (tipoInstalacion === 'monofasica' || tipoInstalacion === 'trifasica') && 
        tieneBaterias === true && 
        tipoBaterias === 'otra') {
      return true;
    }
    
    return false;
  };

  // Funciones para editar información del comunero
  const iniciarEdicion = () => {
    // Prellenar con datos disponibles tanto del comunero como del form principal
    setInfoEditada({
      nombre: form.comunero?.nombre || form.nombre || '',
      telefono: form.comunero?.telefono || form.telefono || '',
      direccion: form.comunero?.direccion || form.direccion || '',
      codigoPostal: form.comunero?.codigoPostal || form.codigoPostal || '',
      ciudad: form.comunero?.ciudad || form.ciudad || '',
      provincia: form.comunero?.provincia || form.provincia || ''
    });
    setEditandoInfo(true);
  };

  const guardarEdicion = async () => {
    if (!form.comunero || !form.propuestaId) {
      showToast('Error: Faltan datos necesarios para guardar', 'error');
      return;
    }

    // Validaciones obligatorias
    if (!infoEditada.direccion || infoEditada.direccion.trim() === '') {
      showToast('La dirección es obligatoria', 'error');
      return;
    }

    if (!infoEditada.codigoPostal || infoEditada.codigoPostal.trim() === '') {
      showToast('El código postal es obligatorio para generar la propuesta', 'error');
      return;
    }

    if (!infoEditada.nombre || infoEditada.nombre.trim() === '') {
      showToast('El nombre es obligatorio', 'error');
      return;
    }

    if (!infoEditada.telefono || infoEditada.telefono.trim() === '') {
      showToast('El teléfono es obligatorio', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar datos para enviar al backend
      const datosEdicion = {
        propuestaId: form.propuestaId,
        nombre: infoEditada.nombre,
        telefono: infoEditada.telefono,
        direccion: infoEditada.direccion,
        codigoPostal: infoEditada.codigoPostal,
        ciudad: infoEditada.ciudad,
        provincia: infoEditada.provincia,
        token: form.token,
        comuneroId: form.comunero.id,
        mpkLogId: form.mpkLogId || ''
      };

      console.log('📤 Enviando datos actualizados al backend:', datosEdicion);
      
      // Enviar datos al backend
      const response = await comuneroService.editarInfoComunero(datosEdicion);
      
      if (response.success) {
        // Actualizar los datos del comunero en el store con la información actualizada del backend
        const comuneroActualizado = {
          ...form.comunero,
          ...infoEditada
        };
        
        // Si el backend devuelve información actualizada, usarla
        if (response.data && response.data.updatedInfo) {
          Object.assign(comuneroActualizado, response.data.updatedInfo);
        }
        
        // Usar setField para actualizar comunero
        const { setField } = useFormStore.getState();
        setField('comunero', comuneroActualizado);
        
        // Si el backend devuelve nueva información de zona, actualizarla también
        if (response.data && response.data.updatedInfo && response.data.updatedInfo.enZona) {
          setField('enZona', response.data.updatedInfo.enZona);
          console.log('🎯 Zona actualizada:', response.data.updatedInfo.enZona);
        }
        
        setEditandoInfo(false);
        showToast('Información actualizada correctamente', 'success');
        
        console.log('✅ Información del comunero actualizada:', comuneroActualizado);
        console.log('📍 Respuesta completa del backend:', response.data);
      } else {
        throw new Error(response.error || 'Error al actualizar la información');
      }
      
    } catch (error) {
      console.error('❌ Error al actualizar información del comunero:', error);
      showToast(
        error instanceof Error ? error.message : 'Error al actualizar la información',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditandoInfo(false);
    setInfoEditada({
      nombre: '',
      telefono: '',
      direccion: '',
      codigoPostal: '',
      ciudad: '',
      provincia: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setInfoEditada(prev => ({
      ...prev,
      [field]: value
    }));
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
              
              // Mostrar descripción detallada de la IA en un modal centrado
              if (descripcion) {
                setTimeout(() => {
                  setAnalisisModalContent(descripcion);
                  setShowAnalisisModal(true);
                  
                  
                  setTimeout(() => {
                    window.scrollTo({
                      top: 110,
                      behavior: 'smooth'
                    });
                  }, 100); // Pequeño delay para que el modal se renderice primero
                }, 500); // Delay de 1 segundo para que se vea después del primer toast
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
        <div className="bg-white rounded-4 p-5 shadow-lg border w-100 mx-auto" style={{maxWidth: 700}}>
          
          

          {/* Información del comunero */}
          {form.comunero && (
            <div className="mb-5">
              <div className="bg-light rounded-3 p-4 border">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold text-secondary mb-1">
                      <span className="me-2">📋</span>
                      Esta es la información que tenemos:
                    </h5>
                    <small className="text-muted">
                      Puedes editarla si necesitas hacer algún cambio
                    </small>
                    
                    {/* Loading de búsqueda de datos actualizados */}
                    {loadingDatosActualizados && (
                      <div className="alert alert-info border-0 mt-2 mb-0 py-2">
                        <div className="d-flex align-items-center">
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Buscando...</span>
                          </div>
                          <small>
                            <strong>Estamos buscando la información más reciente...</strong>
                          </small>
                        </div>
                      </div>
                    )}
                    
                    {/* Alerta de código postal faltante */}
                    {!loadingDatosActualizados && !codigoPostalDisponible && (
                      <div className="alert alert-warning border-0 mt-2 mb-0 py-2">
                        <div className="d-flex align-items-center">
                          <span className="me-2">⚠️</span>
                          <small>
                            <strong>Código postal requerido:</strong> Completa tu dirección para continuar con la propuesta
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                  {!editandoInfo && !loadingDatosActualizados && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={iniciarEdicion}
                    >
                      <span className="me-1">✏️</span>
                      Editar
                    </button>
                  )}
                </div>

                {editandoInfo ? (
                  // Modo edición
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <span className="me-2">👤</span>Nombre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={infoEditada.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <span className="me-2">📞</span>Teléfono <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={infoEditada.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <span className="me-2">📮</span>Código Postal <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={infoEditada.codigoPostal}
                        onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-12">
                      <GoogleAddressInput
                        value={infoEditada.direccion}
                        onChange={(newAddress) => handleInputChange('direccion', newAddress)}
                        onPostalCodeChange={(codigoPostal) => {
                          // Siempre actualizar el código postal (puede ser vacío para resetear)
                          handleInputChange('codigoPostal', codigoPostal);
                        }}
                        onCityChange={(ciudad) => {
                          // Siempre actualizar la ciudad (puede ser vacía para resetear)
                          handleInputChange('ciudad', ciudad);
                        }}
                        onProvinceChange={(provincia) => {
                          // Siempre actualizar la provincia (puede ser vacía para resetear)
                          handleInputChange('provincia', provincia);
                        }}
                      />
                      <small className="form-text text-muted">
                        <strong>Importante:</strong> La dirección debe incluir código postal para generar la propuesta
                      </small>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <span className="me-2">🏙️</span>Ciudad
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={infoEditada.ciudad}
                        onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <span className="me-2">🗺️</span>Provincia
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={infoEditada.provincia}
                        onChange={(e) => handleInputChange('provincia', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-12">
                      <div className="alert alert-info py-2">
                        <small>
                          <strong>Nota:</strong> Los campos marcados con <span className="text-danger">*</span> son obligatorios. 
                          El código postal es especialmente importante para generar una propuesta precisa.
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={cancelarEdicion}
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={guardarEdicion}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <span className="me-1">💾</span>
                              Guardar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Modo visualización
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <span className="me-2">👤</span>
                        <div>
                          <small className="text-muted d-block">Nombre</small>
                          <span className="fw-semibold">{form.comunero?.nombre || form.nombre || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <span className="me-2">📧</span>
                        <div>
                          <small className="text-muted d-block">Email</small>
                          <span className="fw-semibold">{form.comunero?.email || form.mail || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <span className="me-2">📞</span>
                        <div>
                          <small className="text-muted d-block">Teléfono</small>
                          <span className="fw-semibold">{form.comunero?.telefono || form.telefono || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex align-items-start">
                        <span className="me-2 mt-1">📍</span>
                        <div>
                          <small className="text-muted d-block">Dirección</small>
                          <span className="fw-semibold">{form.comunero?.direccion || form.direccion || 'No especificada'}</span>
                          {(form.comunero?.codigoPostal || form.codigoPostal) && (form.comunero?.ciudad || form.ciudad) && (
                            <div className="mt-1">
                              <small className="text-muted">
                                {form.comunero?.codigoPostal || form.codigoPostal} - {form.comunero?.ciudad || form.ciudad}
                                {(form.comunero?.provincia || form.provincia) && `, ${form.comunero?.provincia || form.provincia}`}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Banner principal */}
          <div className="text-center mb-5">
            <div className="bg-primary bg-opacity-10 rounded-3 p-4 mb-4">
              <h1 className="h4 fw-bold text-primary mb-3">
                PARA PODER OFRECERTE UNA PROPUESTA PERSONALIZADA
              </h1>
              <p className="h6 text-secondary mb-0">
                NECESITAMOS QUE CONTESTES A LAS SIGUIENTES PREGUNTAS
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="d-grid gap-4">
            
            {/* Pregunta 1: ¿Tienes instalación fotovoltaica? */}
            <div>
              <label className={`form-label h5 fw-bold mb-3 ${!codigoPostalDisponible ? 'text-muted' : ''}`}>
                ¿Tienes instalación fotovoltaica instalada en tu vivienda? <span className="text-danger">*</span>
                {!codigoPostalDisponible && (
                  <small className="d-block text-warning mt-1">
                    <i className="fas fa-lock me-1"></i>
                    Completa tu dirección en la sección "Esta es la información que tenemos" para continuar
                  </small>
                )}
              </label>
              <div className="d-flex gap-4">
                {/* disabled temporal  */}
                <div className="form-check" >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="instalacionFV"
                    id="instalacionSi"
                    checked={tieneInstalacionFV === true}
                    onChange={() => handleInstalacionChange(true)}
                    // disabled={!codigoPostalDisponible}
                    disabled={true}
                  />
                  <label className={`form-check-label fw-semibold ${!codigoPostalDisponible ? 'text-muted' : ''}`} htmlFor="instalacionSi">
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
                    disabled={!codigoPostalDisponible}
                  />
                  <label className={`form-check-label fw-semibold ${!codigoPostalDisponible ? 'text-muted' : ''}`} htmlFor="instalacionNo">
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Cuando tiene instalación FV, mostrar mensaje y proceder directamente a contactar asesor */}
            {tieneInstalacionFV === true && (
              <div className="fade-in-result">
                <div className="alert alert-info border-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">✅</span>
                    <div>
                      <strong>Perfecto.</strong> Ya tienes instalación fotovoltaica.<br />
                      <small>Nuestro equipo especializado evaluará tu instalación actual para ofrecerte la mejor solución de baterías.</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pregunta sobre inversor Huawei - Solo si tiene instalación FV (OCULTA PARA FLUJO DIRECTO) */}
            {false && tieneInstalacionFV === true && (
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

            {/* Si tiene Huawei = SÍ - Tipo de inversor Huawei (OCULTA PARA FLUJO DIRECTO) */}
            {false && tieneInstalacionFV === true && tieneInversorHuawei === 'si' && (
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

            {/* Si tipo de inversor Huawei = DESCONOZCO - Upload foto (OCULTA PARA FLUJO DIRECTO) */}
            {false && tieneInstalacionFV === true && tieneInversorHuawei === 'si' && tipoInversorHuawei === 'desconozco' && (
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
                        {fotoInversor?.name}
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

            {/* Si tiene Huawei = DESCONOZCO - Upload foto (OCULTA PARA FLUJO DIRECTO) */}
            {false && tieneInstalacionFV === true && tieneInversorHuawei === 'desconozco' && (
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
                        {fotoInversor?.name}
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

            {/* Si tiene Huawei = NO - Mensaje informativo (OCULTA PARA FLUJO DIRECTO) */}
            {false && tieneInstalacionFV === true && tieneInversorHuawei === 'no' && (
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
                  Tipo de instalación en tu vivienda<span className="text-danger">*</span>
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
            {/* disabled temporal */}
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
                      disabled={true}
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
                <div className="alert alert-warning border-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">👨‍💼</span>
                    <small>
                      <strong>Entendido.</strong> Un especialista evaluará tu instalación actual de baterías y se contactará contigo para ofrecerte la mejor propuesta de ampliación.
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
                    <label className="form-check-label fw-bold " htmlFor="instalacionCercaSi">
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
                    <label className="form-check-label fw-bold" htmlFor="instalacionCercaNo">
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

                {/* Pregunta sobre metros extra - solo si respondió NO a los 10m */}
                {instalacionCerca10m === false && (
                  <div className="fade-in-result mt-4">
                    <label className="form-label h5 fw-bold mb-3">
                      ¿Cuántos metros extra necesitaríamos? <span className="text-danger">*</span>
                    </label>
                    
                    <div className="row g-2">
                      <div className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn w-100 btn-option ${metrosExtra === '5m extra' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setRespuestaPregunta('metrosExtra', '5m extra')}
                        >
                          5m extra
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn w-100 btn-option ${metrosExtra === '10m extra' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setRespuestaPregunta('metrosExtra', '10m extra')}
                        >
                          10m extra
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn w-100 btn-option ${metrosExtra === '15m extra' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setRespuestaPregunta('metrosExtra', '15m extra')}
                        >
                          15m extra
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn w-100 btn-option ${metrosExtra === 'más de 15m' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setRespuestaPregunta('metrosExtra', 'más de 15m')}
                        >
                          Más de 15m
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn w-100 btn-option ${metrosExtra === 'lo desconoce' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setRespuestaPregunta('metrosExtra', 'lo desconoce')}
                        >
                          Lo desconozco
                        </button>
                      </div>
                      
                      <div className="col-6 col-md-4">
                        <button
                          type="button"
                          className={`btn w-100 btn-option ${metrosExtra === 'prefiero hablar con un asesor' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setRespuestaPregunta('metrosExtra', 'prefiero hablar con un asesor')}
                        >
                           Prefiero hablar con un asesor
                        </button>
                      </div>
                    </div>

                    {/* Mensaje informativo según la selección de metros extra */}
                    {metrosExtra && (
                      <div className="mt-3">
                        {(metrosExtra === '5m extra' || metrosExtra === '10m extra' || metrosExtra === '15m extra') && (
                          <div className="alert alert-success border-0 fade-in-result">
                            <div className="d-flex align-items-center">
                              <span className="me-2">✅</span>
                              <small>
                                <strong>Perfecto.</strong> Continuaremos con tu propuesta considerando los metros extra necesarios.
                              </small>
                            </div>
                          </div>
                        )}
                        
                        {(metrosExtra === 'más de 15m' || metrosExtra === 'lo desconoce' || metrosExtra === 'prefiero hablar con un asesor') && (
                          <div className="alert alert-warning border-0 fade-in-result">
                            <div className="d-flex align-items-center">
                              <span className="me-2">👨‍💼</span>
                              <small>
                                <strong>Entendido.</strong> Un especialista técnico evaluará tu caso específico y se contactará contigo pronto.
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                        onChange={(e) => handleTipoCuadroElectricoChange(e.target.value)}
                      />
                      <label className="form-check-label d-block" htmlFor="cuadroTipo1">
                        <div className=" rounded-3 overflow-hidden mb-2 d-flex align-items-center justify-content-center" style={{ cursor: 'pointer', height: '340px', backgroundColor: '' }}>
                          <img 
                            src={ejemploCuadroMonofasico} 
                            alt="Cuadro eléctrico monofásico - Ejemplo tipo 1" 
                            className="img-fluid"
                            style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                          />
                        </div>
                        <strong className="d-block text-center">Cuadro Monofásico</strong>
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
                        onChange={(e) => handleTipoCuadroElectricoChange(e.target.value)}
                      />
                      <label className="form-check-label d-block" htmlFor="cuadroTipo2">
                        <div className=" rounded-3 overflow-hidden mb-2 d-flex align-items-center justify-content-center" style={{ cursor: 'pointer', height: '340px', backgroundColor: '' }}>
                          <img 
                            src={ejemploCuadroTrifasico} 
                            alt="Cuadro eléctrico trifásico - Ejemplo tipo 2" 
                            className="img-fluid"
                            style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                          />
                        </div>
                        <strong className="d-block text-center">Cuadro Trifásico</strong>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Mensaje informativo cuando se selecciona tipo1 o tipo2 */}
                {(tipoCuadroElectrico === 'tipo1' || tipoCuadroElectrico === 'tipo2') && (
                  <div className="alert alert-success border-0 fade-in-result mb-4">
                    <div className="d-flex align-items-center">
                      <span className="me-2">✅</span>
                      <small>
                        <strong>¡Perfecto!</strong> Hemos identificado que tienes una instalación{' '}
                        <strong>{tipoCuadroElectrico === 'tipo1' ? 'monofásica' : 'trifásica'}</strong>.
                        Continuaremos con tu propuesta personalizada.
                      </small>
                    </div>
                  </div>
                )}

                {/* Opción "Ninguno coincide" */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="tipoCuadro"
                    id="cuadroNinguno"
                    value="ninguno"
                    checked={tipoCuadroElectrico === 'ninguno'}
                    onChange={(e) => handleTipoCuadroElectricoChange(e.target.value)}
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
                        Puedes subir una foto de tu cuadro eléctrico para que nuestra IA la analice y te demos una respuesta más rápida.
                      </p>
                      
                      <div className="mb-3">
                        <label htmlFor="fotoDisyuntor" className="form-label fw-semibold">
                          Foto del cuadro eléctrico (opcional)
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
                            📸 Toma una foto clara de tu cuadro eléctrico principal
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
              {/* Si necesita contactar asesor, mostrar botón diferente */}
              {debeContactarAsesor() ? (
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
                  disabled={loading || !codigoPostalDisponible}
                  style={{
                    background: !codigoPostalDisponible 
                      ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
                      : 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    border: 'none',
                    opacity: !codigoPostalDisponible ? 0.6 : 1
                  }}
                >
                  {loading ? 'Guardando...' : 
                   !codigoPostalDisponible ? 'Completa tu dirección para continuar' :
                   'Continuar con mi propuesta'}
                </button>
              )}
              
              <small className="text-muted text-center">
                {!codigoPostalDisponible 
                  ? 'Necesitamos tu código postal para generar una propuesta precisa'
                  : debeContactarAsesor()
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

      {/* Modal de Análisis de IA */}
      {showAnalisisModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-robot me-2"></i>
                  Análisis Inteligente Completado
                </h5>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: 60, height: 60}}>
                    <i className="fas fa-brain text-primary fs-3"></i>
                  </div>
                </div>
                <p className="lead mb-0">{analisisModalContent}</p>
              </div>
              <div className="modal-footer justify-content-center border-0">
                <button 
                  type="button" 
                  className="btn btn-primary px-4"
                  onClick={() => setShowAnalisisModal(false)}
                >
                  <i className="fas fa-check me-2"></i>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageTransition>
  );
};

export default PreguntasAdicionales;
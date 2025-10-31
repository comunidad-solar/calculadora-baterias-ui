import { useUsuario } from '../context/UsuarioContext';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
// import logoCS from '../assets/logocircularcs.png';
// import bateriaEcoflow from '../assets/bateriaEcoflow1.png';
import bateriaSolax from '../assets/Bateria_SolaXCover_Image.png';
// import ecoflowProposalBattery from '../assets/EcoFlowProposalBattery.png';
import solaxProposalBattery from '../assets/BateríaSolaXTransparentBackground.png';
// import ecoflowLogo from '../assets/ECOFLOWLOGO.png';
import solaxLogo from '../assets/SolaXBatteryLogo.png';
import imagenFondoPropuesta4 from '../assets/imagenFondoPropuesta4.png';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFormStore } from '../zustand/formStore';
import { bateriaService } from '../services/apiService';
import iconoBateria from '../assets/SolaXBatteryIcon.svg'
import iconoDescargaElectricidad from '../assets/BateriaSolaXElectricidadIcon.svg'
import iconResilence from '../assets/SolaXResilienceIcon.svg'
import iconAhorro from '../assets/SolaXBatteryIcono.svg'
import iconSeguridad from '../assets/BateriaSolaxIcono.svg'
// propuesta para reservar baterías
// Tipos para los datos de la propuesta
interface ProductItem {
  item_id?: string;
  name?: string;
  attribute_option_name1?: string;
  rate?: number;
  [key: string]: any;
}

interface PropuestaData {
  amount: number;
  productData: {
    items: ProductItem[];
    group_name: string;
    [key: string]: any;
  };
  usuario: {
    nombre: string;
    email: string;
    direccion: {
      calle: string;
      ciudad: string;
      provincia: string;
      codigoPostal: string;
    };
  };
  [key: string]: any;
}

const Propuesta = () => {
  const { validacionData, usuario } = useUsuario();
  const { form } = useFormStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener datos de la propuesta del state de navegación
  const propuestaData: PropuestaData | undefined = location.state?.propuestaData;
  
  // Obtener información del tipo de instalación y si requiere visita técnica
  const tipoInstalacion: string = location.state?.tipoInstalacion || '';
  const requiereVisitaTecnica: boolean = location.state?.requiereVisitaTecnica || false;
  
  // Información específica de visita técnica
  const visitaTecnicaCompletada: boolean = location.state?.visitaTecnicaCompletada || false;
  const fsmState: string = location.state?.fromFsmState || '';
  const reservaPagada: boolean = location.state?.reservaPagada || false;
  const visitaPagada: boolean = location.state?.visitaPagada || false;
  
  // Debug: mostrar datos recibidos
  // console.log('📋 Datos de propuesta recibidos:', propuestaData);
  // console.log('📋 Estructura completa de propuestaData:', JSON.stringify(propuestaData, null, 2));
  // console.log('📋 Datos del UsuarioContext:', { validacionData, usuario });
  // console.log('📋 Datos del FormStore:', { comunero: form.comunero, enZona: form.enZona });
  
  // Debug: mostrar información del tipo de instalación
  // console.log('⚡ Tipo de instalación detectado:', tipoInstalacion);
  // console.log('🔧 ¿Requiere visita técnica?:', requiereVisitaTecnica);
  // console.log('📍 Location state completo:', location.state);
  
  // Debug: información de visita técnica si aplica
  if (visitaTecnicaCompletada) {
    // console.log('✅ Visita técnica completada - Botón de solicitar visita deshabilitado');
  }
  
  // Debug para servidor: verificar si estamos en modo debug
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
  // console.log('🔧 Modo debug:', isDebugMode);
  
  // Datos por defecto si no hay propuestaData
  const defaultAmount = 4699;
  const defaultItems: (ProductItem | string)[] = [
    { name: "Pack Baterías EcoFlow 5 kWh" },
    { name: "1x EcoFlow PowerOcean LFP Battery 5kWh" },
    { name: "1x Inversor Híbrido EcoFlow PowerOcean DC Fit 12kW" },
    { name: "Instalación profesional completa" },
    { name: "Garantía extendida de 10 años" },
    { name: "Monitorización y mantenimiento" }
  ];
  
  // Usar datos de la propuesta o valores por defecto
  const amount = propuestaData?.amount || defaultAmount;
  const baseItems: (ProductItem | string)[] = propuestaData?.productData?.mapped_items || defaultItems;
  
  // Items adicionales básicos que siempre se agregan
  const basicAdditionalItems: string[] = [
    "Instalación profesional certificada",
    "Sistema de respaldo incorporado (BackUp)",
  ];
  
  // Obtener la respuesta sobre instalación fotovoltaica desde el store
  const tieneInstalacionFV = form.respuestasPreguntas?.tieneInstalacionFV;
  
  // Debug: verificar el valor de tieneInstalacionFV
  // console.log('🔍 Debug tieneInstalacionFV:', tieneInstalacionFV, 'tipo:', typeof tieneInstalacionFV);
  // console.log('🔍 Debug respuestasPreguntas completo:', form.respuestasPreguntas);
  
  // Items adicionales condicionados
  const conditionalItems: string[] = [];
  
  // Solo agregar legalización si tiene instalación fotovoltaica
  if (tieneInstalacionFV === true) {
    conditionalItems.push("Legalización (*Solo si se tiene instalación fotovoltaica)");
    // console.log('✅ Agregando item de legalización porque tiene instalación FV');
  } else {
    // console.log('❌ NO agregando item de legalización. Valor:', tieneInstalacionFV);
  }
  
  // Combinar todos los items adicionales
  const additionalItems: string[] = [...basicAdditionalItems, ...conditionalItems];
  
  // Combinar items base con items adicionales
  const items: (ProductItem | string)[] = [...baseItems, ...additionalItems];
  
  // Crear datos de fallback usando el store de Zustand si UsuarioContext no tiene datos
  const fallbackValidacionData = validacionData || {
    token: form.token || '',
    comunero: form.comunero || {
      id: '',
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    enZona: form.enZona || 'inZone'
  };
  
  // Crear usuario de fallback con datos más completos
  const fallbackUsuario = usuario || (form.comunero ? {
    id: form.comunero.id || '',
    nombre: form.comunero.nombre || '',
    email: form.comunero.email || '',
    telefono: form.comunero.telefono || '',
    direccion: form.comunero.direccion || '',
    codigoPostal: form.comunero.codigoPostal,
    ciudad: form.comunero.ciudad,
    provincia: form.comunero.provincia
  } : null);
  
  const usuario_propuesta = propuestaData?.usuario || fallbackUsuario;
  const groupName = propuestaData?.productData?.name || 'Pack Batería Monofásico EcoFlow 5 kWh con Inversor de 12 kW';
  
  // Estado para los modales
  const [showModal, setShowModal] = useState(false);
  const [showVisitaTecnicaModal, setShowVisitaTecnicaModal] = useState(false);
  const [showDniModal, setShowDniModal] = useState(false);
  const [dniInput, setDniInput] = useState('');
  const [loadingReserva, setLoadingReserva] = useState(false);
  const [showConfirmacionEnvio, setShowConfirmacionEnvio] = useState(false);
  
  // Obtener enZona desde múltiples fuentes posibles (solo strings válidos)
  const enZonaFromPropuesta = propuestaData?.conditions?.enZona;
  const enZonaFromFallback = fallbackValidacionData?.enZona;
  const enZonaFromNestedData = propuestaData?.data?.conditions?.enZona;
  
  // Validar enZona - solo acepta los 3 valores válidos como strings
  // const valoresValidosEnZona = ["inZone", "inZoneWithCost", "outZone"];
  const enZonaParaValidar = enZonaFromPropuesta || enZonaFromFallback || enZonaFromNestedData;
  
  const enZonaValida = !enZonaParaValidar || 
                      (typeof enZonaParaValidar === 'string' && 
                       (enZonaParaValidar === "inZone" || enZonaParaValidar === "inZoneWithCost"));
  
  // Debug adicional: si enZona no es válida, mostrar por qué
  if (!enZonaValida) {
    console.error('🚫 enZona INVÁLIDA - Análisis detallado:');
  }

  // Funciones para manejar botones
  const handleContactarAsesor = () => {
    window.open('https://comunidadsolar.zohobookings.eu/#/108535000004860368', '_blank');
  };
  const [buttonVTDisabled, setButtonVTDisabled] = useState(false);
  const handleSolicitarVisitaTecnica = async () => {
    try {
      setButtonVTDisabled(true);
      // Obtener propuestaId del store (ya guardada previamente)
      const propuestaIdFromStore = form.propuestaId;
      
      if (!propuestaIdFromStore) {
        console.error('❌ No se encontró propuestaId para la solicitud');
        alert('Error: No se puede procesar la solicitud. Contacta con soporte.');
        return;
      }

      

      // Extraer datos de direccion si es un objeto
      let direccionTexto = '';
      let ciudad = '';
      let provincia = '';
      let codigoPostal = '';
      
      if (typeof usuarioDisplay.direccion === 'string') {
        direccionTexto = usuarioDisplay.direccion;
      } else if (usuarioDisplay.direccion && typeof usuarioDisplay.direccion === 'object') {
        const dir = usuarioDisplay.direccion as any;
        direccionTexto = dir.calle || '';
        ciudad = dir.ciudad || '';
        provincia = dir.provincia || '';
        codigoPostal = dir.codigoPostal || '';
      }

      // Preparar datos para la solicitud
      const datosVisitaTecnica = {
        propuestaId: propuestaIdFromStore,
        email: usuarioDisplay.email,
        nombre: usuarioDisplay.nombre,
        telefono: (usuarioDisplay as any).telefono || '',
        direccion: direccionTexto,
        ciudad: ciudad || (usuarioDisplay as any).ciudad || '',
        provincia: provincia || (usuarioDisplay as any).provincia || '',
        codigoPostal: codigoPostal || (usuarioDisplay as any).codigoPostal || '',
        contactId: fallbackValidacionData?.comunero?.id,
        token: fallbackValidacionData?.token,
        dealId: (fallbackValidacionData as any)?.dealId,
        enZona: fallbackValidacionData?.enZona,
        tipoSolicitud: 'visita_tecnica' as const,
        motivo: 'Solicitud de visita técnica desde propuesta de baterías',
        // Parámetros UTM desde el store
        utm_source: form.utm_source || '',
        utm_medium: form.utm_medium || '',
        utm_campaign: form.utm_campaign || '',
        utm_term: form.utm_term || '',
        utm_content: form.utm_content || '',
        // Campos legacy mantenidos para compatibilidad
        campaignSource: form.campaignSource || '',
        utm: form.utm || '',
        type: "reserva"
      };

      

      // Llamar al servicio
      const resultado = await bateriaService.solicitarVisitaTecnica(datosVisitaTecnica);

      if (resultado.success) {
        
        // Verificar si está en modo asesores
        const isAsesores = form.asesores;
        
        if (!isAsesores && resultado.data?.paymentLink) {

          
          // Pequeño delay para feedback visual
          setTimeout(() => {
            if (resultado.data?.paymentLink) {
              window.location.href = resultado.data.paymentLink;
            }
          }, 500);
        } else {
          // Está en dominio de asesores o no hay URL de pago - mostrar modal tradicional
          setShowVisitaTecnicaModal(true);
        }
      } else {
        console.error('❌ Error al solicitar visita técnica:', resultado.error);
        alert('Error al procesar tu solicitud. Por favor, inténtalo de nuevo o contacta con soporte.');
      }
    } catch (error) {
      // console.error('❌ Error inesperado:', error);
      alert('Error inesperado. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      // Solo resetear el botón si no hay redirección
      if (form.asesores) {
        setButtonVTDisabled(false);
      }
      // Si no es asesor y hay redirección, no reseteamos ya que el usuario será redirigido
    }
  };

  const handleComprar = async () => {
    // Obtener propuestaId del store (ya guardada previamente)
    const propuestaIdFromStore = form.propuestaId;
    
    if (!propuestaIdFromStore) {
      console.error('❌ No se encontró propuestaId para el proceso de compra');
      alert('Error: No se puede procesar la compra. Contacta con soporte.');
      return;
    }

    // Mostrar modal para pedir DNI antes de continuar
    setShowDniModal(true);
  };

  const handleConfirmarCompra = async () => {
    // Validar DNI
    if (!dniInput || dniInput.trim() === '') {
      alert('Por favor, ingresa tu DNI para continuar.');
      return;
    }

    // Validar formato de DNI, NIE o TIE español
    const dniInput_clean = dniInput.trim().toUpperCase();
    
    // DNI español: 8 números + 1 letra
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    
    // NIE: X, Y o Z + 7 números + 1 letra
    const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    
    // TIE: T + 8 números + 1 letra
    const tieRegex = /^T[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    
    if (!dniRegex.test(dniInput_clean) && !nieRegex.test(dniInput_clean) && !tieRegex.test(dniInput_clean)) {
      alert('Por favor, ingresa un documento válido:\n• DNI: 8 números + letra (ej: 12345678A)\n• NIE: X/Y/Z + 7 números + letra (ej: X1234567A)\n• TIE: T + 8 números + letra (ej: T12345678A)');
      return;
    }

    setLoadingReserva(true);
    
    try {
      const propuestaIdFromStore = form.propuestaId;

      // Extraer nombre y apellido del usuario
      const nombreCompleto = usuarioDisplay.nombre || 'Usuario';
      const partesNombre = nombreCompleto.trim().split(' ');
      const name = partesNombre[0] || 'Usuario';
      const lastname = partesNombre.slice(1).join(' ') || '';

      // Generar enlace de pago para la reserva
      const resultado = await bateriaService.generarEnlacePago({
        propuestaId: propuestaIdFromStore!,
        dni: dniInput.trim(),
        name: name,
        lastname: lastname,
        mpkLogId: form.mpkLogId || undefined,
        email: usuarioDisplay.email || undefined,
      });

      if (resultado.success) {
        
        
        // Verificar si está en modo asesores
        const isAsesores = form.asesores;
        
        if (!isAsesores && resultado.data?.paymentURL) {
          // No está en dominio de asesores - redirigir a Stripe Checkout
          
          
          // Cerrar modal y mostrar loading brevemente antes de redirigir
          setShowDniModal(false);
          setDniInput('');
          
          // Pequeño delay para que el usuario vea que se está procesando
          setTimeout(() => {
            if (resultado.data?.paymentURL) {
              window.location.href = resultado.data.paymentURL;
            }
          }, 500);
        } else {
          // Está en dominio de asesores - mostrar confirmación tradicional
          setShowDniModal(false);
          setDniInput('');
          setShowConfirmacionEnvio(true);
        }
      } else {
        alert('Error al procesar la reserva. Por favor, inténtalo de nuevo o contacta con soporte.');
      }
    } catch (error) {
      console.error('❌ Error inesperado en reserva:', error);
      alert('Error inesperado. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoadingReserva(false);
    }
  };

  if (!fallbackValidacionData && !isDebugMode) {
    console.error('❌ No hay fallbackValidacionData, redirigiendo a home');
    navigate('/');
    return null;
  }
  
  if ((!usuario_propuesta || !usuario_propuesta.nombre) && !isDebugMode) {
    console.error('❌ No hay usuario_propuesta válido, redirigiendo a home');
    console.error('   usuario_propuesta:', usuario_propuesta);
    navigate('/');
    return null;
  }
  
  if (!enZonaValida && !isDebugMode) {
    console.error('❌ enZona no es válida, redirigiendo a home');
    console.error('   Valor analizado:', enZonaParaValidar);
    navigate('/');
    return null;
  }

  // Crear usuario de display con datos de fallback para el render
  const usuarioDisplay = usuario_propuesta || {
    nombre: 'Usuario',
    email: 'usuario@ejemplo.com',
    direccion: 'Dirección no disponible'
  };

  return (
    <PageTransition>
      <div 
        className="min-vh-100 py-4" 
        style={{ backgroundColor: '#FAFAF5' }}
      >
        <div className="container-fluid" style={{ maxWidth: '1200px' }}>
          
          {/* Botón volver en la esquina superior izquierda */}
          <div className="position-relative mb-3">
            <BackButton />
          </div>

          {/* Header con saludo personalizado */}
          {/* <div 
            className="gradient-border shadow-sm position-relative"
            style={{
              borderRadius: '20px'
            }}
          >
            <div className="bg-white p-3 rounded-4">
              <div className="d-flex align-items-center gap-3">
                <div className="flex-shrink-0">
                  <img 
                    src={logoCS} 
                    alt="Comunidad Solar" 
                    style={{ width: '100px', height: '100px' }}
                  />

                  {/* Fallback logo 
                  <div 
                    className="bg-primary bg-opacity-10 rounded-circle d-none align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <span style={{fontSize: '1.5rem'}}>🏠</span>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-1 fw-bold">Hola, {usuarioDisplay.nombre}</h4>
                  <p className="mb-0 text-secondary">
                    Aquí tienes la propuesta de baterías que mejor se adapta a tu ubicación y necesidades específicas
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Mensaje informativo para instalaciones trifásicas */}
          {tipoInstalacion === 'trifasica' && (
            <div className="mt-4">
              <div 
                className={`rounded-4 p-4 ${
                  visitaTecnicaCompletada 
                    ? 'bg-info bg-opacity-10 border border-info' 
                    : 'bg-warning bg-opacity-10 border border-warning'
                }`}
                style={{
                  borderColor: visitaTecnicaCompletada ? '#0DCAF0 !important' : '#FFC107 !important',
                  backgroundColor: visitaTecnicaCompletada 
                    ? 'rgba(13, 202, 240, 0.1) !important' 
                    : 'rgba(255, 193, 7, 0.1) !important'
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-shrink-0">
                    <span style={{ fontSize: '2rem' }}>
                      {visitaTecnicaCompletada ? '🔧' : '⚠️'}
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-2" style={{ 
                      color: visitaTecnicaCompletada ? '#055160' : '#B8860B' 
                    }}>
                      {fsmState === '06_VISITA_TECNICA' 
                        ? 'Instalación Trifásica - Visita Técnica Pendiente'
                        : visitaTecnicaCompletada 
                          ? 'Instalación Trifásica - Visita Técnica Completada' 
                          : 'Instalación Trifásica'
                      }
                    </h5>
                    <p className="mb-2" style={{ 
                      color: visitaTecnicaCompletada ? '#0A58CA' : '#7A6914', 
                      fontSize: '1rem', 
                      lineHeight: '1.5' 
                    }}>
                      {fsmState === '06_VISITA_TECNICA' 
                        ? 'Nuestro equipo técnico está a la espera del pago para realizar la evaluación de tu instalación trifásica. Esta propuesta no es final, es informativa.'
                        : visitaTecnicaCompletada 
                          ? 'Nuestro equipo técnico ha completado la evaluación de tu instalación trifásica. Esta propuesta refleja los ajustes necesarios identificados durante la visita técnica.'
                          : 'Tu instalación eléctrica es trifásica, lo que requiere una evaluación técnica personalizada antes de proceder con la instalación de las baterías.'
                      }
                    </p>
                    <p className="mb-0" style={{ 
                      color: visitaTecnicaCompletada ? '#0A58CA' : '#7A6914', 
                      fontSize: '0.95rem' 
                    }}>
                      {fsmState === '06_VISITA_TECNICA' 
                        ? null
                        : visitaTecnicaCompletada 
                          ? <><strong>¡Listo para reservar!</strong> Los precios y componentes mostrados incluyen todas las modificaciones técnicas necesarias para tu instalación trifásica.</>
                          : <><strong>¿Qué significa esto?</strong> La propuesta mostrada es orientativa. Nuestro equipo técnico debe evaluar tu instalación específica para garantizar la compatibilidad y seguridad del sistema.</>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección Pack Batería */}
          <div className="mt-5">
            <div className="row g-0">
              <div className="col-lg-6">
                {/* Título FUERA de la card */}
                 <div className="flex-grow-1 mt-4">
                  <h4 className="mb-1 fw-bold">Hola, {usuarioDisplay.nombre}:</h4>
                  <p className="mb-0 text-secondary">
                    Aquí tienes la propuesta de baterías que mejor se adapta
                  </p>
                </div>
                <h1 
                  className="fw-bold mb-4 mt-2" 
                  style={{
                    background: 'linear-gradient(90deg, #4BCCE2, #58B9C6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '2.5rem',
                    lineHeight: '1.2'
                  }}
                >
                  {groupName}
                </h1>

                {/* Banner de Reserva Pagada o Visita Pagada */}
                {(reservaPagada || visitaPagada) && (
                  <div className="alert alert-success border-0 shadow-sm mb-4" 
                       style={{
                         background: 'linear-gradient(90deg, #28a745, #20c997)',
                         borderRadius: '15px'
                       }}>
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fas fa-check-circle me-3" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                      <div className="text-white">
                        <h4 className="mb-1 fw-bold">
                          {reservaPagada ? '¡Reserva Pagada!' : '¡Visita Pagada!'}
                        </h4>
                        <p className="mb-0">
                          {reservaPagada 
                            ? 'Tu reserva ha sido confirmada y el pago procesado exitosamente.'
                            : 'Tu visita técnica ha sido confirmada y el pago procesado exitosamente.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Cards con precio y botón - Dos cards lado a lado */}
                <div className="row g-3">
                  {/* Card 1: Pago único */}
                  <div className="col-md-6">
                    <div className="bg-white rounded-4 shadow-lg p-4 h-100 text-center position-relative"
                         style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="mb-3">
                        <p className="mb-2 fw-medium" style={{ color: '#58B9C6', fontSize: '1rem' }}>
                          En un solo pago único
                        </p>
                        <div className="d-flex align-items-baseline justify-content-center gap-1 mb-2">
                          <span className="fw-bold" style={{ 
                            color: '#58B9C6', 
                            fontSize: '2.5rem',
                            lineHeight: '1'
                          }}>
                            {amount.toLocaleString('es-ES')}€
                          </span>
                        </div>
                        <p className="mb-0" style={{ 
                          color: '#666', 
                          fontSize: '0.9rem'
                        }}>
                          (IVA incluido)
                        </p>
                        <p className="mb-3 mt-2" style={{ 
                          color: '#9D9D9D', 
                          fontSize: '0.8rem'
                        }}>
                          Incluye sistema de respaldo + Instalación
                        </p>
                      </div>
                      
                      {/* Botón para card de pago único */}
                      {!reservaPagada && !visitaPagada && fsmState !== '06_VISITA_TECNICA' && (
                        (requiereVisitaTecnica && tipoInstalacion === 'trifasica') ? (
                          <button 
                            className="btn btn-lg px-4 py-2 fw-bold text-white border-0 w-100"
                            style={{
                              background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                              borderRadius: '50px',
                              fontSize: '1rem'
                            }}
                            onClick={handleComprar}
                          >
                            RESERVAR
                          </button>
                        ) : (
                          <button 
                            className="btn btn-lg px-4 py-2 fw-bold text-white border-0 w-100"
                            style={{
                              background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                              borderRadius: '50px',
                              fontSize: '1rem'
                            }}
                            onClick={handleComprar}
                          >
                            RESERVAR
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Card 2: Financiación */}
                  <div className="col-md-6">
                    <div className="bg-white rounded-4 shadow-lg p-4 h-100 text-center position-relative"
                         style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="mb-3">
                        <p className="mb-2 fw-medium" style={{ color: '#58B9C6', fontSize: '1rem' }}>
                          Financiado desde 
                        </p>
                        <div className="d-flex align-items-baseline justify-content-center gap-1 mb-2">
                          <span className="fw-bold" style={{ 
                            color: '#58B9C6', 
                            fontSize: '2.5rem',
                            lineHeight: '1'
                          }}>
                            49€/mes
                          </span>
                        </div>
                        <p className="mb-0" style={{ 
                          color: '#666', 
                          fontSize: '0.9rem'
                        }}>
                          (IVA incluido)
                        </p>
                        <p className="mb-3 mt-2" style={{ 
                          color: '#9D9D9D', 
                          fontSize: '0.8rem'
                        }}>
                          Incluye sistema de respaldo + Instalación
                        </p>
                      </div>
                      
                      {/* Botón para card de financiación */}
                      {!reservaPagada && !visitaPagada && fsmState !== '06_VISITA_TECNICA' && (
                        (requiereVisitaTecnica && tipoInstalacion === 'trifasica') ? (
                          <button 
                            className="btn btn-lg px-4 py-2 fw-bold text-white border-0 w-100"
                            style={{
                              background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                              borderRadius: '50px',
                              fontSize: '1rem'
                            }}
                            onClick={handleComprar}
                          >
                            RESERVAR
                          </button>
                        ) : (
                          <button 
                            className="btn btn-lg px-4 py-2 fw-bold text-white border-0 w-100"
                            style={{
                              background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                              borderRadius: '50px',
                              fontSize: '1rem'
                            }}
                            onClick={handleComprar}
                          >
                            RESERVAR
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
              
              {/* Imagen de la batería */}
              <div className="col-lg-6">
                <div className="h-100 d-flex align-items-center justify-content-center p-4">
                  <img 
                    src={bateriaSolax} 
                    alt="Batería Solax" 
                    className="img-fluid rounded-4"
                    style={{ 
                      maxHeight: '100%',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Botones adicionales */}
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Solo mostrar botón de visita técnica si no se ha completado ya y no hay reserva o visita pagada */}
              {!visitaTecnicaCompletada && !reservaPagada && !visitaPagada && (
                <button 
                  className="btn px-4 py-2 gradient-border-btn"
                  style={{
                    background: 'white',
                    color: '#58B9C6',
                    borderRadius: '100px',
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box'
                  }}
                  onClick={handleSolicitarVisitaTecnica}
                  disabled={buttonVTDisabled}
                >
                  SOLICITAR VISITA TÉCNICA
                </button>
              )}
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#58B9C6' }}>ℹ️</span>
                <span style={{ color: '#58B9C6' }}>¿Tienes dudas?</span>
              </div>
              <button 
                className="btn px-4 py-2 gradient-border-btn"
                style={{
                  background: 'white',
                  color: '#58B9C6',
                  borderRadius: '100px',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box'
                }}
                onClick={handleContactarAsesor}
              >
                CONTACTA CON UN ASESOR
              </button>
            </div>
          </div>

          <div style={{background:'white'}}>
          {/* Sección: ¿Qué incluye la instalación? */}
          <div className="mt-5">
            {/* Header con beneficios - Pegadas con líneas blancas */}
            <div className="mb-4">
              <div className="d-flex rounded-3 overflow-hidden shadow-sm">
                <div className="flex-fill p-3 text-center" style={{ backgroundColor: '#58B9C6', color: 'white' }}>
                  <h5 className="mb-0 fw-bold">Seguridad ante apagones</h5>
                </div>
                <div style={{ width: '2px', backgroundColor: 'white' }}></div>
                <div className="flex-fill p-3 text-center" style={{ backgroundColor: '#58B9C6', color: 'white' }}>
                  <h5 className="mb-0 fw-bold">Aumenta el ahorro</h5>
                </div>
                <div style={{ width: '2px', backgroundColor: 'white' }}></div>
                <div className="flex-fill p-3 text-center" style={{ backgroundColor: '#58B9C6', color: 'white' }}>
                  <h5 className="mb-0 fw-bold">Autonomía Energética</h5>
                </div>
              </div>
            </div>

            {/* Título de la sección */}
            <h2 className="text-center fw-bold mb-4" style={{ fontSize: '2rem', color: '#333' }}>
              ¿Qué incluye la instalación?
            </h2>

            {/* Lista de componentes incluidos en dos columnas */}
            <div className="mb-4" style={{padding: '0 35px'}}>
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  <div className="row">
                    {(() => {
                      // Función para calcular la distribución de items
                      const totalItems = items.length;
                      const leftColumnCount = Math.ceil(totalItems / 2);
                      const rightColumnCount = totalItems - leftColumnCount;
                      
                      const leftItems = items.slice(0, leftColumnCount);
                      const rightItems = items.slice(leftColumnCount);
                      
                      return (
                        <>
                          {/* Columna izquierda */}
                          <div className="col-md-6">
                            {leftItems.map((item: ProductItem | string, index: number) => {
                              const itemText = typeof item === 'string' 
                                ? item 
                                : (item.attribute_option_name1 || item.name || 'Producto sin nombre');
                              const isLegalizacion = itemText.includes('Legalización (*Solo si se tiene instalación fotovoltaica)');
                              
                              return (
                                <div key={index} className="d-flex align-items-start gap-3 mb-3">
                                  <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                                    <span style={{ 
                                      color: isLegalizacion ? '#CF3B3B' : '#4BCCE2', 
                                      fontSize: '1.2rem',
                                      fontWeight: 'bold'
                                    }}>
                                      →
                                    </span>
                                  </div>
                                  <div className="flex-grow-1">
                                    <p className="mb-0" style={{ 
                                      color: isLegalizacion ? '#CF3B3B' : '#2A2A2A', 
                                      fontSize: '1rem',
                                      fontWeight: '500',
                                      lineHeight: '1.4'
                                    }}>
                                      {itemText}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Item especial "Extra fuera de zona" en columna izquierda si aplica */}
                            {validacionData?.enZona === 'inZoneWithCost' && leftColumnCount <= rightColumnCount && (
                              <div className="d-flex align-items-start gap-3 mb-3">
                                <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                                  <span style={{ 
                                    color: '#FF6B35', 
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                  }}>
                                    →
                                  </span>
                                </div>
                                <div className="flex-grow-1">
                                  <p className="mb-0" style={{ 
                                    color: '#FF6B35', 
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    lineHeight: '1.4'
                                  }}>
                                    Extra fuera de zona
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Columna derecha */}
                          <div className="col-md-6">
                            {rightItems.map((item: ProductItem | string, index: number) => {
                              const itemText = typeof item === 'string' 
                                ? item 
                                : (item.attribute_option_name1 || item.name || 'Producto sin nombre');
                              const isLegalizacion = itemText.includes('Legalización (*Solo si se tiene instalación fotovoltaica)');
                              
                              return (
                                <div key={index + leftColumnCount} className="d-flex align-items-start gap-3 mb-3">
                                  <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                                    <span style={{ 
                                      color: isLegalizacion ? '#CF3B3B' : '#4BCCE2', 
                                      fontSize: '1.2rem',
                                      fontWeight: 'bold'
                                    }}>
                                      →
                                    </span>
                                  </div>
                                  <div className="flex-grow-1">
                                    <p className="mb-0" style={{ 
                                      color: isLegalizacion ? '#CF3B3B' : '#2A2A2A', 
                                      fontSize: '1rem',
                                      fontWeight: '500',
                                      lineHeight: '1.4'
                                    }}>
                                      {itemText}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Item especial "Extra fuera de zona" en columna derecha si aplica */}
                            {validacionData?.enZona === 'inZoneWithCost' && leftColumnCount > rightColumnCount && (
                              <div className="d-flex align-items-start gap-3 mb-3">
                                <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                                  <span style={{ 
                                    color: '#FF6B35', 
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                  }}>
                                    →
                                  </span>
                                </div>
                                <div className="flex-grow-1">
                                  <p className="mb-0" style={{ 
                                    color: '#FF6B35', 
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    lineHeight: '1.4'
                                  }}>
                                    Extra fuera de zona
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>


          </div>
          

          {/* Sección: Características de las Baterías */}
          <div className="mt-5">
            <div className="row g-0">
              {/* Imagen de la batería EcoFlow */}
              <div className="col-lg-7" >
                <div className="position-relative d-flex flex-column align-items-center">
                  {/* Fondo verde decorativo - más pequeño */}
                  <div 
                    className="position-absolute rounded-4"
                    style={{ 
                      backgroundColor: '#BFF2F9',
                      width: '100%',
                      height: '80%',
                      top: '10%',
                      left: '10%',
                      transform: 'rotate(-12deg)',
                      zIndex: 0
                    }}
                  ></div>
                  
                  <div className="position-relative p-1 d-flex align-items-center justify-content-center" style={{ zIndex: 1, width: '100%', minHeight: '500px' }}>
                    <img 
                      src={solaxProposalBattery} 
                      alt="EcoFlow Battery System" 
                      className="img-fluid"
                      style={{ 
                        maxWidth: '100%',
                        height: 'auto',
                        minHeight: '400px',
                        maxHeight: '500px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  
                  {/* Logo EcoFlow - centrado debajo de la imagen */}
                  <div className="text-center" style={{ zIndex: 1 }}>
                    <img 
                      src={solaxLogo} 
                      alt="EcoFlow Logo" 
                      style={{ 
                        height: '90px',
                        width: 'auto'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Card de características */}
              <div className="col-lg-5" style={{padding: '0 35px 0 0'}}>
                <div 
                  className="bg-white rounded-4 shadow-lg p-4 h-100"
                  style={{ 
                    // border: '3px solid #A0D034',
                    position: 'relative'
                  }}
                >
                                    {/* Título */}
                  <h3 className="fw-bold mb-2" style={{ color: '#2A2A2A', fontSize: '1.6rem' }}>
                    Características de las Baterías
                  </h3>
                  
                  {/* Subtítulo */}
                  <p className="mb-3" style={{ color: '#666', fontSize: '1rem' }}>
                    Potencia la rentabilidad de tu energía y protégete ante apagones y emergencias.
                  </p>
                  
                  {/* Línea divisoria */}
                  <hr style={{ borderColor: '#A0D034', borderWidth: '2px' }} />
                  
                  {/* Lista de características */}
                  <div className="mt-3">
                    {[
                      { icon: '🛡️', text: 'Sistema de extinción de incendios integrado.' },
                      { icon: '🔋', text: 'BMS inteligente que protege contra sobrecargas.' },
                      { icon: '☔', text: 'Certificación IP65: protege de la lluvia y el polvo.' },
                      { icon: '🌡️', text: 'Módulo de calentamiento automático.' },
                      { icon: '🔌', text: 'Instalación plug&play, rápida sin complicación.' },
                      { icon: '📱', text: 'Control total desde tu móvil con la App.' },
                      { icon: '⚡', text: '6 kW de potencia para evitar cortes de luz.' },
                      { icon: '🔇', text: 'Sistema antiincendios, seguro y silencioso.' },
                      { icon: '📜', text: '15 años de garantía real, por escrito.' },
                      { icon: '👁️', text: 'Un diseño que no querrás esconder.' },
                      { icon: '💰', text: 'Precio exclusivo para comuneros' }
                    ].map((item, index) => (
                      <div key={index} className="d-flex align-items-start gap-2 mb-1">
                        <span style={{ fontSize: '1rem', minWidth: '20px' }}>{item.icon}</span>
                        <span style={{ color: '#2A2A2A', fontSize: '0.85rem', lineHeight: '1.3' }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Botón COMPRAR */}
                  <div className="text-center mt-3">
                    {!reservaPagada && !visitaPagada && fsmState !== '06_VISITA_TECNICA' && (
                      (requiereVisitaTecnica && tipoInstalacion === 'trifasica') ? (
                        // Botón para instalaciones trifásicas que necesitan evaluación
                        <button 
                          className="btn btn-lg px-4 py-2 fw-bold text-white border-0"
                          style={{
                            background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                            borderRadius: '100px',
                            fontSize: '1.1rem',
                            minWidth: '220px'
                          }}
                          onClick={handleComprar}
                        >
                          RESERVAR
                        </button>
                      ) : (
                        // Botón RESERVAR normal
                        <button 
                          className="btn btn-lg px-4 py-2 fw-bold text-white border-0"
                          style={{
                            background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                            borderRadius: '100px',
                            fontSize: '1.1rem',
                            minWidth: '220px'
                          }}
                          onClick={handleComprar}
                        >
                          RESERVAR
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Sección: Proceso para obtener tu Batería */}
        <div className="container-fluid mt-5 py-5" style={{ maxWidth: '1200px', backgroundColor: '#EFFDFF', borderRadius: '20px' }}>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#2A2A2A', fontSize: '2.5rem' }}>
             Proceso para obtener tu Batería
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="d-flex align-items-center justify-content-center position-relative">
                
                {/* Paso 01 - Contratación */}
                <div className="text-center flex-fill position-relative">
                  {/* Número con círculo */}
                  <div className="d-flex justify-content-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#58B9C6',
                        color: 'white'
                      }}
                    >
                      01
                    </div>
                  </div>
                  
                  {/* Título del paso */}
                  <h4 className="fw-bold mb-3" style={{ color: '#58B9C6', fontSize: '1.4rem' }}>
                    Formulario
                  </h4>
                  
                  {/* Descripción */}
                  <p className="mb-0" style={{ color: '#2A2A2A', fontSize: '0.95rem', lineHeight: '1.4' }}>
                    Activar el proceso de contratación, firma y pago.
                  </p>
                  
                  {/* Línea horizontal conectora hacia el paso siguiente */}
                  <div 
                    className="position-absolute d-none d-lg-block"
                    style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#58B9C6',
                      top: '20px',
                      left: '55%',
                      zIndex: 0
                    }}
                  ></div>
                </div>

                {/* Paso 02 - Instalación */}
                <div className="text-center flex-fill position-relative">
                  {/* Número con círculo */}
                  <div className="d-flex justify-content-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: 'white',
                        border: '2px solid #58B9C6',
                        color: '#58B9C6',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}
                    >
                      02
                    </div>
                  </div>
                  
                  {/* Título del paso */}
                  <h4 className="fw-bold mb-3" style={{ color: '#58B9C6', fontSize: '1.4rem' }}>
                    Propuesta
                  </h4>
                  
                  {/* Descripción */}
                  <p className="mb-0" style={{ color: '#2A2A2A', fontSize: '0.95rem', lineHeight: '1.4' }}>
                    Nos pondremos en contacto contigo para la petición de la información necesaria para instalar.
                  </p>
                  
                  {/* Línea horizontal conectora hacia el paso siguiente */}
                  <div 
                    className="position-absolute d-none d-lg-block"
                    style={{
                      width: '50%',
                      height: '2px',
                      backgroundColor: '#58B9C6',
                      top: '20px',
                      left: '0%',
                      zIndex: 0
                    }}
                  ></div>
                   <div 
                    className="position-absolute d-none d-lg-block"
                    style={{
                      width: '50%',
                      height: '2px',
                      backgroundColor: '#58B9C6',
                      top: '20px',
                      left: '46%',
                      zIndex: 0
                    }}
                  ></div>
                    <div 
                    className="position-absolute d-none d-lg-block"
                    style={{
                      width: '50%',
                      height: '2px',
                      backgroundColor: '#58B9C6',
                      top: '20px',
                      left: '76%',
                      zIndex: 0
                    }}
                  ></div>
                </div>

                {/* Paso 03 - Legalización */}
                <div className="text-center flex-fill">
                  {/* Número con círculo */}
                  <div className="d-flex justify-content-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: 'white',
                        border: '2px solid #58B9C6',
                        color: '#58B9C6',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}
                    >
                      03
                    </div>
                  </div>
                  
                  {/* Título del paso */}
                  <h4 className="fw-bold mb-3" style={{ color: '#58B9C6', fontSize: '1.4rem' }}>
                    Pago de reserva
                  </h4>
                  
                  {/* Descripción */}
                  <p className="mb-0" style={{ color: '#2A2A2A', fontSize: '0.95rem', lineHeight: '1.4' }}>
                    Comunicación del boletín y/o legalización con Industria
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Sección: ¿Cómo funcionan las Baterías EcoFlow? */}
        <div 
          className="mt-5 py-5 position-relative"
          style={{
            backgroundImage: `url(${imagenFondoPropuesta4})`,
           backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '600px'
          }}
        >
          {/* Capa de overlay semitransparente sobre la imagen */}
          <div 
           className="position-absolute top-0 start-0 w-100 h-100"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 1)', // 
            zIndex: 1 
          }}
          ></div>
          
          <div className="container-fluid position-relative" style={{ maxWidth: '1200px', zIndex: 2 }}>
            {/* Título */}
            <div className="text-center mb-5">
              <h2 className="" style={{ color: '#2A2A2A', fontSize: '2.5rem' }}>
                Funcionamiento de <strong>baterías</strong>
              </h2>
            </div>

            {/* Las 3 cards */}
            <div className="row g-4 mb-5 justify-content-center">
              {/* Card 01 - Generador de Electricidad */}
              <div className="col-lg-3 col-md-4">
                <div className="bg-white rounded-4 p-4 h-100 shadow-lg text-center position-relative" style={{ minHeight: '280px' }}>
                  {/* Número 01 */}
                  <div className="position-absolute top-0 start-0 mt-3 ms-3">
                    <span style={{ color: '#4BCCE2', fontSize: '1.2rem', fontWeight: 'bold' }}>01</span>
                  </div>
                  
                  {/* Título */}
                  <h5 className="mb-4" style={{ color: '#2A2A2A', fontSize: '1.2rem' }}>
                    Carga de<br /> <strong>baterías</strong>
                  </h5>
                  
                  {/* Icono centrado */}
                  <div className="d-flex justify-content-center mb-4">
                    <img 
                      src={iconoBateria} 
                      alt="Comunidad Solar" 
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                  
                  {/* Texto */}
                  <p className="mb-0" style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    La batería se carga con la energía de la red en las horas más baratas. De esta manera se mantiene cargada y lista para usarse en cualquier tipo de situación.​
                  </p>
                  
                </div>
              </div>

              {/* Card 02 - Carga de Baterías */}
              {/* <div className="col-lg-3 col-md-4">
                <div className="bg-white rounded-4 p-4 h-100 shadow-lg text-center position-relative" style={{ minHeight: '280px' }}>
                  {/* Número 02 
                  <div className="position-absolute top-0 start-0 mt-3 ms-3">
                    <span style={{ color: '#4BCCE2', fontSize: '1.2rem', fontWeight: 'bold' }}>02</span>
                  </div>
                  
                  {/* Título 
                  <h5 className=" mb-4" style={{ color: '#2A2A2A', fontSize: '1.2rem' }}>
                    Carga de<br /><strong>Baterías</strong>
                  </h5>
                  
                  {/* Icono centrado 
                  <div className="d-flex justify-content-center mb-4">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="#4BCCE2">
                      <rect x="25" y="20" width="40" height="60" rx="5" fill="#4BCCE2" stroke="#4BCCE2" strokeWidth="2"/>
                      <rect x="45" y="15" width="10" height="8" rx="2" fill="#4BCCE2"/>
                      <rect x="30" y="25" width="30" height="10" fill="white"/>
                      <rect x="30" y="40" width="30" height="10" fill="white"/>
                      <rect x="30" y="55" width="30" height="10" fill="white"/>
                      <path d="M50 30 L42 45 L48 45 L48 55 L58 40 L52 40 L52 30 Z" fill="#FFD700"/>
                      <circle cx="75" cy="30" r="3" fill="#A0D034"/>
                      <circle cx="75" cy="50" r="3" fill="#A0D034"/>
                      <circle cx="75" cy="70" r="3" fill="#A0D034"/>
                      <path d="M70 30 L80 30 M70 50 L80 50 M70 70 L80 70" stroke="#A0D034" strokeWidth="2"/>
                    </svg>
                  </div>
                  
                  {/* Texto 
                  <p className="mb-0" style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    Solo cogerás energía de la red si tus excedentes almacenados son menores a tu consumo.
                  </p>
                </div>
              </div> */}

              {/* Card 03 - Descarga de Electricidad */}
              <div className="col-lg-3 col-md-4">
                <div className="bg-white rounded-4 p-4 h-100 shadow-lg text-center position-relative" style={{ minHeight: '280px' }}>
                  {/* Número 03 */}
                  <div className="position-absolute top-0 start-0 mt-3 ms-3">
                    <span style={{ color: '#4BCCE2', fontSize: '1.2rem', fontWeight: 'bold' }}>02</span>
                  </div>
                  
                  {/* Título */}
                  <h5 className=" mb-4" style={{ color: '#2A2A2A', fontSize: '1.2rem' }}>
                    Descarga de<br /> <strong>Electricidad</strong>
                  </h5>
                  
                  {/* Icono centrado */}
                  <div className="d-flex justify-content-center mb-4">
                    <img 
                      src={iconoDescargaElectricidad} 
                      alt="Comunidad Solar" 
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                  
                  {/* Texto */}
                  <p className="mb-0" style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    En las emergencias eléctricas y en las noches se utiliza la energía almacenada. Así, se reduce tu factura eléctrica además de proteger tu suministro eléctrico.​
                  </p>
                </div>
              </div>
            </div>

            {/* Botón COMPRAR centrado */}
            <div className="text-center">
              {!reservaPagada && !visitaPagada && (requiereVisitaTecnica && tipoInstalacion === 'trifasica' && fsmState !== '06_VISITA_TECNICA') ? (
                // Botón para instalaciones trifásicas que necesitan evaluación (solo antes de solicitar)
                <button 
                  className="btn btn-lg px-5 py-3 fw-bold text-white border-0"
                  style={{
                    background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                    borderRadius: '100px',
                    fontSize: '1.3rem',
                    minWidth: '250px'
                  }}
                  onClick={handleComprar}
                >
                  COMPRAR EN GRUPO
                </button>
              ) : (
                // Solo mostrar RESERVAR si NO estamos en estado 06_VISITA_TECNICA
                (!reservaPagada && !visitaPagada && fsmState !== '06_VISITA_TECNICA') && (
                  <button 
                    className="btn btn-lg px-5 py-3 fw-bold text-white border-0 comprar-btn"
                    style={{
                      background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                      borderRadius: '100px',
                      fontSize: '1.3rem',
                      minWidth: '250px'
                    }}
                    onClick={handleComprar}
                  >
                    COMPRAR EN GRUPO
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Sección: Ventajas Baterías EcoFlow */}
        <div className="container-fluid mt-5 py-5" style={{ maxWidth: '1200px', backgroundColor: '#EFFDFF', borderRadius: '20px' }}>
          <div className="px-4">
            {/* Título */}
            <div className="mb-5">
              <h3 className="fw-bold" style={{ color: '#4BCCE2', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                Ventajas
              </h3>
              <h2 className="fw-bold" style={{ color: '#2A2A2A', fontSize: '2.5rem', marginBottom: '0' }}>
                De tener baterías en casa
              </h2>
            </div>

            {/* Las 3 ventajas */}
            <div className="row g-5 mb-5">
              {/* Ventaja 1 - Resiliencia ante crisis */}
              <div className="col-lg-4">
                
                 <div className="d-flex justify-content-center mb-4">
                    <img 
                      src={iconResilence} 
                      alt="Comunidad Solar" 
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                
                <h4 className="fw-bold mb-2" style={{ color: '#4BCCE2', fontSize: '1.5rem' }}>
                  Resiliencia
                </h4>
                <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A', fontSize: '1.1rem' }}>
                  ante crisis
                </h5>
                
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  La Comisión Europea recomienda que los ciudadanos estén preparados para posibles emergencias o <strong>cortes de suministro</strong>, disponiendo de provisiones esenciales para garantizar su autonomía durante un mínimo de 72 horas.
                </p>
              </div>

              {/* Ventaja 2 - Seguridad y autonomía energética */}
              <div className="col-lg-4">
                <div className="text-center mb-4">
                  {/* Icono circular azul */}
                  <div className="d-flex justify-content-center mb-4">
                    <img 
                      src={iconSeguridad} 
                      alt="Comunidad Solar" 
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                </div>
                
                <h4 className="fw-bold mb-2" style={{ color: '#4BCCE2', fontSize: '1.5rem' }}>
                  Seguridad
                </h4>
                <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A', fontSize: '1.1rem' }}>
                  y autonomía energética
                </h5>
                
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Contar con baterías en casa te permite <strong>almacenar energía</strong> de forma segura y garantizar el funcionamiento continuo de dispositivos esenciales en cortes o emergencias, <strong>reduciendo la dependencia de la red</strong> y mejorando el <strong>bienestar familiar</strong>.
                </p>
              </div>

              {/* Ventaja 3 - Ahorro desde el primer día */}
              <div className="col-lg-4">
                <div className="d-flex justify-content-center mb-4">
                    <img 
                      src={iconAhorro} 
                      alt="Comunidad Solar" 
                      style={{ width: '100px', height: '100px' }}
                    />
                  </div>
                
                <h4 className="fw-bold mb-2" style={{ color: '#4BCCE2', fontSize: '1.5rem' }}>
                  Ahorro
                </h4>
                <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A', fontSize: '1.1rem' }}>
                  desde el primer día
                </h5>
                
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Además de mejorar la seguridad, las baterías domésticas ayudan a <strong>optimizar el consumo eléctrico</strong>, almacenando energía en horas de bajo coste para utilizarla en momentos de mayor demanda, <strong>reduciendo así la factura de luz</strong>.
                </p>
              </div>
            </div>

            {/* Botones alineados: RESERVAR a la izquierda, contacto a la derecha */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              {/* Botón RESERVAR alineado a la izquierda */}
              <div>
                {(!reservaPagada && !visitaPagada && fsmState !== '06_VISITA_TECNICA') && (
                  (requiereVisitaTecnica && tipoInstalacion === 'trifasica') ? (
                    // Botón para instalaciones trifásicas que necesitan evaluación
                    <button 
                      className="btn btn-lg px-5 py-3 fw-bold text-white border-0"
                      style={{
                        background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                        borderRadius: '100px',
                        fontSize: '1.2rem',
                        minWidth: '220px'
                      }}
                      onClick={handleComprar}
                    >
                      RESERVAR
                    </button>
                  ) : (
                    // Botón RESERVAR normal
                    <button 
                      className="btn btn-lg px-5 py-3 fw-bold text-white border-0"
                      style={{
                        background: 'linear-gradient(90deg, #58B9C6, #4BCCE2)',
                        borderRadius: '100px',
                        fontSize: '1.2rem',
                        minWidth: '220px'
                      }}
                      onClick={handleComprar}
                    >
                      RESERVAR
                    </button>
                  )
                )}
              </div>
              
              {/* Texto y botón de contacto alineados a la derecha */}
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ color: '#4BCCE2', fontSize: '1.2rem' }}>ℹ️</span>
                  <span style={{ color: '#4BCCE2', fontSize: '1rem' }}>¿Tienes dudas?</span>
                </div>
                <button 
                  className="btn px-4 py-2"
                  style={{
                    background: 'white',
                    color: '#4BCCE2',
                    borderRadius: '100px',
                    border: '2px solid #4BCCE2',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                  onClick={handleContactarAsesor}
                >
                  CONTACTA CON UN ASESOR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos específicos para el borde gradient */}
      <style>{`
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
        
        /* Borde gradient personalizado con esquinas redondeadas */
        .gradient-border {
          position: relative;
          background: linear-gradient(90deg, #58B9C6, #FFAD2A, #4BCCE2);
          border-radius: 20px;
          padding: 3px;
        }
        
        .gradient-border .bg-white {
          border-radius: 17px; /* Ligeramente menor para que se vea el borde */
        }
        
        /* Botón COMPRAR con efecto hover */
        .comprar-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(92, 160, 14, 0.3);
          transition: all 0.3s ease;
        }
        
        /* Botón con borde gradiente */
        .gradient-border-btn {
          position: relative;
          background: white;
          border: none !important;
        }
        
        .gradient-border-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(90deg, #58B9C6, #FFB900, #4BCCE2);
          border-radius: 100px;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
        }
        
        .gradient-border-btn:hover::before {
          background: linear-gradient(90deg, #58B9C6, #FFB900, #4BCCE2);
        }
        
        /* Soporte para gradients de texto en navegadores */
        @supports (-webkit-background-clip: text) {
          .gradient-text {
            background: linear-gradient(90deg, #58B9C6, #B0D83E);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
        
        /* Contenedor de items con flexbox */
        .items-container {
          /* En desktop: calcular para que quepan exactamente 4 cards por fila */
          max-width: calc(4 * 230px + 3 * 1rem); /* 4 cards + 3 gaps */
        }
        
        .item-card {
          width: 230px;
          flex-shrink: 0;
        }
        
        @media (max-width: 992px) {
          .items-container {
            max-width: calc(3 * 230px + 2 * 1rem); /* 3 cards + 2 gaps */
          }
        }
        
        @media (max-width: 768px) {
          .items-container {
            max-width: calc(2 * 230px + 1 * 1rem); /* 2 cards + 1 gap */
          }
          .item-card {
            width: 200px;
          }
        }
        
        @media (max-width: 576px) {
          .items-container {
            max-width: 100%;
          }
          .item-card {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>

      {/* Modal para compra online usando Portal */}
      {showModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white border-0 shadow-lg" 
            style={{
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-3" style={{background: 'linear-gradient(135deg, #5CA00E, #B0D83E)', borderRadius: '20px 20px 0 0', position: 'relative'}}>
              <h4 className="text-white fw-bold mb-0">
                🚀 ¡Pronto habilitaremos la compra online!
              </h4>
              <button 
                type="button" 
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3" 
                aria-label="Close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="text-center py-4 px-4">
              <div className="mb-4">
                <div className="mx-auto mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #5CA00E, #B0D83E)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{fontSize: '2rem'}}>🔔</span>
                </div>
                <h5 className="fw-bold text-dark mb-3">Te avisaremos apenas esté disponible</h5>
                <p className="text-muted mb-0" style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                  Estamos trabajando para ofrecerte la mejor experiencia de compra. 
                  Mientras tanto, puedes contactar con uno de nuestros asesores para obtener más información.
                </p>
              </div>
            </div>
            <div className="text-center pb-4">
              <button 
                type="button" 
                className="btn btn-lg me-3" 
                style={{
                  background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 30px',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
                onClick={handleContactarAsesor}
              >
                Contactar Asesor
              </button>
              <button 
                type="button" 
                className="btn btn-lg" 
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #ddd',
                  borderRadius: '25px',
                  padding: '12px 30px',
                  fontSize: '1rem'
                }}
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal para visita técnica usando Portal */}
      {showVisitaTecnicaModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '20px'
          }}
          onClick={() => setShowVisitaTecnicaModal(false)}
        >
          <div 
            className="bg-white border-0 shadow-lg" 
            style={{
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-3" style={{background: 'linear-gradient(135deg, #5CA00E, #B0D83E)', borderRadius: '20px 20px 0 0', position: 'relative'}}>
              <h4 className="text-white fw-bold mb-0">
                ✅ ¡Visita Técnica Solicitada!
              </h4>
              <button 
                type="button" 
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3" 
                aria-label="Close"
                onClick={() => setShowVisitaTecnicaModal(false)}
              ></button>
            </div>
            <div className="text-center py-4 px-4">
              <div className="mb-4">
                <div className="mx-auto mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #5CA00E, #B0D83E)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{fontSize: '2rem'}}>🏠</span>
                </div>
                <h5 className="fw-bold text-dark mb-3">La solicitud ha sido registrada</h5>
                <p className="text-muted mb-3" style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                 El enlace de pago ha sido enviado al cliente. El cliente recibirá un email con las instrucciones para completar su reserva.
                </p>
                  <p className="text-muted mb-3" style={{fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 'bold'}}>
                 Ya puedes cerrar esta ventana.
                </p>
                <div className="text-start">
                  {/* <h6 className="fw-bold text-dark mb-2">📋 Próximos pasos:</h6> */}
                  {/* <ul className="text-muted" style={{fontSize: '0.95rem', lineHeight: '1.5'}}>
                    <li>Recibirás una llamada de confirmación</li>
                    <li>Coordinaremos la fecha y hora que mejor te convenga</li>
                    <li>El técnico evaluará tu instalación actual</li>
                    <li>Te proporcionará un presupuesto personalizado</li>
                  </ul> */}
                </div>
              </div>
            </div>
            <div className="text-center pb-4">
              {/* <button 
                type="button" 
                className="btn btn-lg me-3" 
                style={{
                  background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 30px',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
                onClick={handleContactarAsesor}
              >
                Contactar Asesor
              </button> */}
              <button 
                type="button" 
                className="btn btn-lg" 
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #ddd',
                  borderRadius: '25px',
                  padding: '12px 30px',
                  fontSize: '1rem'
                }}
                onClick={() => setShowVisitaTecnicaModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal para pedir DNI antes de reservar */}
      {showDniModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '20px'
          }}
          onClick={() => setShowDniModal(false)}
        >
          <div 
            className="bg-white border-0 shadow-lg" 
            style={{
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-4" style={{background: 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: '20px 20px 0 0'}}>
              <h4 className="text-white fw-bold mb-0">
                <span className="me-2">📝</span>
                Datos para continuar
              </h4>
              <p className="text-white-50 mb-0 small mt-2">
                Necesitamos tu DNI para procesar la contratación
              </p>
            </div>
            
            <div className="p-4">
              <div className="text-center mb-4">
                {/* <div className="bg-light rounded-3 p-3 mb-3">
                  <span className="display-1 mb-0">🆔</span>
                </div> */}
                <p className="text-muted mb-0">
                  Para procesar tu contratación de manera segura, necesitamos que ingreses tu DNI.
                </p>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="me-2">🆔</span>
                  DNI <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Ej: 12345678A"
                  value={dniInput}
                  onChange={(e) => setDniInput(e.target.value)}
                  maxLength={9}
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    letterSpacing: '1px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmarCompra();
                    }
                  }}
                  autoFocus
                />
                <div className="form-text">
                  <small className="text-muted">
                    <strong>Formatos válidos:</strong><br/>
                    • DNI: 8 números + letra (ej: 12345678A)<br/>
                    • NIE: X/Y/Z + 7 números + letra (ej: X1234567A)<br/>
                    • TIE: T + 8 números + letra (ej: T12345678A)
                  </small>
                </div>
              </div>

              <div className="alert alert-info border-0">
                <div className="d-flex align-items-start">
                  <span className="me-2">🔒</span>
                  <div>
                    <small>
                      <strong>Tu información está segura:</strong> El DNI se utiliza únicamente 
                      para el proceso de contratación y cumple con todas las normativas de protección de datos.
                    </small>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-3">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirmarCompra}
                  disabled={!dniInput || dniInput.trim().length < 9 || loadingReserva}
                >
                  {loadingReserva ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      Procesando reserva...
                    </>
                  ) : (
                    <>
                      <span className="me-2">✓</span>
                      Continuar con la contratación
                    </>
                  )}
                </button>
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowDniModal(false);
                    setDniInput('');
                  }}
                  disabled={loadingReserva}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmación de envío */}
      {showConfirmacionEnvio && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '20px'
          }}
          onClick={() => setShowConfirmacionEnvio(false)}
        >
          <div 
            className="bg-white border-0 shadow-lg" 
            style={{
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-4" style={{background: 'linear-gradient(135deg, #28a745, #20c997)', borderRadius: '20px 20px 0 0'}}>
              <h4 className="text-white fw-bold mb-0">
                <span className="me-2">✅</span>
                Solicitud Enviada
              </h4>
              <p className="text-white-50 mb-0 small mt-2">
                El enlace de pago ha sido enviado al cliente
              </p>
            </div>
            
            <div className="p-4 text-center">
              <div className="mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle mx-auto mb-3"
                  style={{ width: '80px', height: '80px' }}
                >
                  <i className="fas fa-paper-plane text-success" style={{ fontSize: '2rem' }}></i>
                </div>
                
                <h5 className="text-success mb-3">¡Solicitud Procesada Exitosamente!</h5>
                
                <p className="text-muted mb-4">
                  El enlace de pago ha sido enviado al cliente. El cliente recibirá un email con las instrucciones para completar su reserva.
                </p>
                
                <div className="alert alert-info" role="alert">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Puedes cerrar esta página.</strong> La solicitud ya fue procesada correctamente.
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => setShowConfirmacionEnvio(false)}
                >
                  <i className="fas fa-check me-2"></i>
                  Entendido
                </button>
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => window.close()}
                >
                  <i className="fas fa-times me-2"></i>
                  Cerrar Página
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
};

export default Propuesta;

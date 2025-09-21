import { useUsuario } from '../context/UsuarioContext';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from './BackButton';
import PageTransition from './PageTransition';
import logoCS from '../assets/logocircularcs.png';
import bateriaEcoflow from '../assets/bateriaEcoflow1.png';
import ecoflowProposalBattery from '../assets/EcoFlowProposalBattery.png';
import ecoflowLogo from '../assets/ECOFLOWLOGO.png';
import imagenFondoPropuesta4 from '../assets/imagenFondoPropuesta4.png';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFormStore } from '../zustand/formStore';

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
  
  // Debug: mostrar datos recibidos
  console.log('📋 Datos de propuesta recibidos:', propuestaData);
  console.log('📋 Datos del UsuarioContext:', { validacionData, usuario });
  console.log('📋 Datos del FormStore:', { comunero: form.comunero, enZona: form.enZona });
  
  // Debug para servidor: verificar si estamos en modo debug
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
  console.log('🔧 Modo debug:', isDebugMode);
  
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
  
  // Items adicionales hardcodeados que siempre se agregan
  const additionalItems: string[] = [
    "Instalación profesional certificada",
    "Material eléctrico", 
    "Legalización (*Solo si se tiene instalación fotovoltaica)",
    "Sistema de respaldo incorporado (BackUp)"
  ];
  
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
  
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  
  console.log('💰 Precio a mostrar:', amount);
  console.log('📦 Items a mostrar:', items);
  console.log('🏷️ Nombre del grupo:', groupName);
  console.log('🔍 PropuestaData completa:', propuestaData);

  // Debug adicional para identificar problemas en servidor
  console.log('🔍 Debug validaciones:');
  console.log('  - validacionData (original):', validacionData);
  console.log('  - fallbackValidacionData:', fallbackValidacionData);
  console.log('  - usuario_propuesta:', usuario_propuesta);
  console.log('  - fallbackValidacionData.enZona:', fallbackValidacionData?.enZona);
  console.log('  - ¿fallbackValidacionData existe?', !!fallbackValidacionData);
  console.log('  - ¿usuario_propuesta existe?', !!usuario_propuesta);
  console.log('  - ¿enZona es válida?', fallbackValidacionData?.enZona === "inZone" || fallbackValidacionData?.enZona === "inZoneWithCost");

  // Funciones para manejar botones
  const handleContactarAsesor = () => {
    window.open('https://comunidadsolar.zohobookings.eu/#/108535000004860368', '_blank');
  };

  const handleComprar = () => {
    setShowModal(true);
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
  
  // Hacer la validación de enZona más permisiva - permitir undefined/null como válido
  const enZonaValida = !fallbackValidacionData?.enZona || 
                      fallbackValidacionData.enZona === "inZone" || 
                      fallbackValidacionData.enZona === "inZoneWithCost";
  
  if (!enZonaValida && !isDebugMode) {
    console.error('❌ enZona no es válida:', fallbackValidacionData?.enZona, 'redirigiendo a home');
    navigate('/');
    return null;
  }
  
  if (isDebugMode) {
    console.log('🔧 Modo debug activo - saltando validaciones');
  }
  
  console.log('✅ Todas las validaciones pasaron, renderizando propuesta');

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
          <div 
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
                  {/* Fallback logo */}
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
          </div>

          {/* Sección Pack Batería */}
          <div className="mt-5">
            <div className="row g-0">
              <div className="col-lg-6">
                {/* Título FUERA de la card */}
                <h1 
                  className="fw-bold mb-4 mt-5" 
                  style={{
                    background: 'linear-gradient(90deg, #79BC1C, #B0D83E)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '2.5rem',
                    lineHeight: '1.2'
                  }}
                >
                  {groupName}
                </h1>
                
                {/* Card con precio y botón */}
                <div className="bg-white rounded-4 shadow-lg p-4 position-relative text-center">
                  {/* Sección precio */}
                  <div className="mb-4">
                    <p 
                      className="mb-2 fw-medium" 
                      style={{ color: '#6FAF32', fontSize: '1.3rem' }}
                    >
                      Tu mejor Pack de Batería solo por
                    </p>
                    <div className="d-flex align-items-baseline justify-content-center gap-2 mb-3">
                      <span 
                        className="fw-bold" 
                        style={{ 
                          color: '#6FAF32', 
                          fontSize: '4rem',
                          lineHeight: '1'
                        }}
                      >
                        {amount.toLocaleString('es-ES')}€
                      </span>
                      <span 
                        style={{ 
                          color: '#6FAF32', 
                          fontSize: '1.2rem',
                          opacity: 0.8
                        }}
                      >
                        (IVA incluido)
                      </span>
                    </div>
                    <p 
                      className="mb-0" 
                      style={{ 
                        color: '#6FAF32', 
                        fontSize: '1.2rem'
                      }}
                    >
                      Incluye sistema de respaldo<br />
                      + Instalación profesional
                    </p>
                  </div>
                  
                  {/* Botón COMPRAR en el borde inferior de la card */}
                  <div className="text-center mt-4 mb-2">
                    <button 
                      className="btn btn-lg px-5 py-3 fw-bold text-white border-0 comprar-btn"
                      style={{
                        background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                        borderRadius: '100px',
                        fontSize: '1.2rem',
                        minWidth: '200px'
                      }}
                      onClick={handleComprar}
                    >
                      COMPRAR
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Imagen de la batería */}
              <div className="col-lg-6">
                <div className="h-100 d-flex align-items-center justify-content-center p-4">
                  <img 
                    src={bateriaEcoflow} 
                    alt="Batería EcoFlow" 
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
          <div className="mt-4 d-flex justify-content-end align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: '#79BC1C' }}>ℹ️</span>
                <span style={{ color: '#79BC1C' }}>¿Tienes dudas?</span>
              </div>
              <button 
                className="btn px-4 py-2 gradient-border-btn"
                style={{
                  background: 'white',
                  color: '#79BC1C',
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
                <div className="flex-fill p-3 text-center" style={{ backgroundColor: '#6FAF32', color: 'white' }}>
                  <h5 className="mb-0 fw-bold">Seguridad ante apagones</h5>
                </div>
                <div style={{ width: '2px', backgroundColor: 'white' }}></div>
                <div className="flex-fill p-3 text-center" style={{ backgroundColor: '#6FAF32', color: 'white' }}>
                  <h5 className="mb-0 fw-bold">Aumenta el ahorro</h5>
                </div>
                <div style={{ width: '2px', backgroundColor: 'white' }}></div>
                <div className="flex-fill p-3 text-center" style={{ backgroundColor: '#6FAF32', color: 'white' }}>
                  <h5 className="mb-0 fw-bold">Autonomía Energética</h5>
                </div>
              </div>
            </div>

            {/* Título de la sección */}
            <h2 className="text-center fw-bold mb-4" style={{ fontSize: '2rem', color: '#333' }}>
              ¿Qué incluye la instalación?
            </h2>

            {/* Grid de componentes incluidos */}
            <div className="mb-4" style={{padding: '0 35px'}}>
              <div 
                className="items-container"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  maxWidth: '1000px',
                  margin: '0 auto',
                  justifyContent: 'center'
                }}
              >
                {items.map((item: ProductItem | string, index: number) => (
                  <div key={index} className="item-card" style={{width: '230px', flexShrink: 0}}>
                    <div className="bg-white rounded-4 p-3 h-100 text-center shadow-sm" style={{ border: '2px solid #A0D034' }}>
                      <h6 className="mb-0" style={{ color: '#2A2A2A', fontSize: '0.9rem' }}>
                        {/* Si el item es un string, usarlo directamente; si es un objeto, usar sus propiedades */}
                        {typeof item === 'string' 
                          ? item 
                          : (item.attribute_option_name1 || item.name || 'Producto sin nombre')
                        }
                      </h6>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nota adicional - Solo mostrar si está fuera de zona o en zona con costo */}
            {validacionData?.enZona === 'inZoneWithCost' && (
              <div className="text-center mt-4">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <span style={{ color: '#79BC1C', fontSize: '1.2rem' }}>⊕</span>
                  <span className="fw-bold" style={{ color: '#79BC1C' }}>
                    Extra (*fuera de zona)
                  </span>
                </div>
              </div>
            )}
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
                      backgroundColor: '#DBF0BE',
                      width: '95%',
                      height: '60%',
                      top: '10%',
                      left: '20%',
                      transform: 'rotate(-10deg)',
                      zIndex: 0
                    }}
                  ></div>
                  
                  <div className="position-relative p-1 d-flex align-items-center justify-content-center" style={{ zIndex: 1, width: '100%', minHeight: '500px' }}>
                    <img 
                      src={ecoflowProposalBattery} 
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
                  <div className="text-center mt-3" style={{ zIndex: 1 }}>
                    <img 
                      src={ecoflowLogo} 
                      alt="EcoFlow Logo" 
                      style={{ 
                        height: '60px',
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
                    border: '3px solid #A0D034',
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
                    <button 
                      className="btn btn-lg px-4 py-2 fw-bold text-white border-0"
                      style={{
                        background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                        borderRadius: '100px',
                        fontSize: '1.1rem',
                        minWidth: '220px'
                      }}
                      onClick={handleComprar}
                    >
                      COMPRAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Sección: Modelo de compra */}
        <div className="container-fluid mt-5" style={{ maxWidth: '1200px' }}>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#2A2A2A', fontSize: '2.5rem' }}>
              Modelo de compra
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Paso 01 - Contratación */}
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center position-relative"
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#ffffffff',
                      border: '3px solid #A0D034'
                    }}
                  >
                    {/* Línea vertical conectora */}
                    <div 
                      className="position-absolute"
                      style={{
                        width: '2px',
                        height: '80px',
                        backgroundColor: '#A0D034',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div 
                    className="d-inline-block px-4 py-2 rounded-pill text-white fw-bold mb-2"
                    style={{ backgroundColor: '#A0D034', fontSize: '1.1rem' }}
                  >
                    01 Contratación
                  </div>
                  <p className="mb-0" style={{ color: '#2A2A2A', fontSize: '1rem', marginLeft: '0' }}>
                    Activar el proceso de contratación, firma y pago.
                  </p>
                </div>
              </div>

              {/* Paso 02 - Instalación y Puesta en Marcha */}
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center position-relative"
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#ffffffff',
                      border: '3px solid #A0D034'
                    }}
                  >
                    {/* Línea vertical conectora */}
                    <div 
                      className="position-absolute"
                      style={{
                        width: '2px',
                        height: '80px',
                        backgroundColor: '#A0D034',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div 
                    className="d-inline-block px-4 py-2 rounded-pill text-white fw-bold mb-2"
                    style={{ backgroundColor: '#A0D034', fontSize: '1.1rem' }}
                  >
                    02 Instalación y Puesta en Marcha
                  </div>
                  <p className="mb-0" style={{ color: '#2A2A2A', fontSize: '1rem', marginLeft: '0' }}>
                    Nos pondremos en contacto contigo para la petición de la información necesaria para instalar.
                  </p>
                </div>
              </div>

              {/* Paso 03 - Legalización */}
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0 me-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: '#ffffffff',
                      border: '3px solid #A0D034'
                    }}
                  >
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div 
                    className="d-inline-block px-4 py-2 rounded-pill text-white fw-bold mb-2"
                    style={{ backgroundColor: '#A0D034', fontSize: '1.1rem' }}
                  >
                    03 Legalización
                  </div>
                  <p className="mb-0" style={{ color: '#2A2A2A', fontSize: '1rem', marginLeft: '0' }}>
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
            backgroundColor: 'rgba(242, 255, 237, 0.89)', // 
            zIndex: 1 
          }}
          ></div>
          
          <div className="container-fluid position-relative" style={{ maxWidth: '1200px', zIndex: 2 }}>
            {/* Título */}
            <div className="text-center mb-5">
              <h2 className="fw-bold" style={{ color: '#2A2A2A', fontSize: '2.5rem' }}>
                ¿Cómo funcionan las Baterías EcoFlow?
              </h2>
            </div>

            {/* Las 3 cards */}
            <div className="row g-4 mb-5 justify-content-center">
              {/* Card 01 - Generador de Electricidad */}
              <div className="col-lg-3 col-md-4">
                <div className="bg-white rounded-4 p-4 h-100 shadow-lg position-relative" style={{ minHeight: '220px' }}>
                  {/* Número verde */}
                  <div className="position-absolute top-0 end-0 mt-3 me-3">
                    <span 
                      className="badge rounded-pill px-3 py-2 fw-bold"
                      style={{ 
                        backgroundColor: '#A0D034', 
                        color: 'white', 
                        fontSize: '1rem'
                      }}
                    >
                      01
                    </span>
                  </div>
                  
                  <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A' }}>
                    Generador de<br />Electricidad
                  </h5>
                  
                  <p className="mb-0" style={{ color: '#666', fontSize: '0.95rem', paddingRight: '90px', paddingBottom: '80px' }}>
                    Durante el día se genera la energía gracias a los paneles y con sus excedentes se llenan las baterías.
                  </p>
                  
                  {/* Icono de torre eléctrica - lado derecho debajo del texto */}
                  <div className="position-absolute" style={{ bottom: '20px', right: '20px' }}>
                    <svg width="70" height="70" viewBox="0 0 24 24" fill="#A0D034">
                      <path d="M8.5 8.64L13 7.74V4.5h-1V2h3v2.5h-1v3.24l4.5.9v1.36h-1v10h-7v-10h-1V8.64zM12 6h1v1h-1V6zm2 5h1v8h-1v-8zm-3 0h1v8h-1v-8zm-2 0h1v8H9v-8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 02 - Carga de Baterías */}
              <div className="col-lg-3 col-md-4">
                <div className="bg-white rounded-4 p-4 h-100 shadow-lg position-relative" style={{ minHeight: '220px' }}>
                  {/* Número verde */}
                  <div className="position-absolute top-0 end-0 mt-3 me-3">
                    <span 
                      className="badge rounded-pill px-3 py-2 fw-bold"
                      style={{ 
                        backgroundColor: '#A0D034', 
                        color: 'white', 
                        fontSize: '1rem'
                      }}
                    >
                      02
                    </span>
                  </div>
                  
                  <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A' }}>
                    Carga de<br />Baterías
                  </h5>
                  
                  <p className="mb-0" style={{ color: '#666', fontSize: '0.95rem', paddingRight: '90px', paddingBottom: '80px' }}>
                    Si la energía almacenada en tus excedentes no cubre tu consumo, podrás tomar el resto de la red.
                  </p>
                  
                  {/* Icono de batería cargándose - lado derecho debajo del texto */}
                  <div className="position-absolute" style={{ bottom: '20px', right: '20px' }}>
                    <svg width="70" height="70" viewBox="0 0 24 24" fill="#A0D034">
                      <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
                      <path d="M13 8L9 13h2v4l4-5h-2z" fill="#FFD700"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 03 - Descarga de Electricidad */}
              <div className="col-lg-3 col-md-4">
                <div className="bg-white rounded-4 p-4 h-100 shadow-lg position-relative" style={{ minHeight: '220px' }}>
                  {/* Número verde */}
                  <div className="position-absolute top-0 end-0 mt-3 me-3">
                    <span 
                      className="badge rounded-pill px-3 py-2 fw-bold"
                      style={{ 
                        backgroundColor: '#A0D034', 
                        color: 'white', 
                        fontSize: '1rem'
                      }}
                    >
                      03
                    </span>
                  </div>
                  
                  <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A' }}>
                    Descarga de<br />Electricidad
                  </h5>
                  
                  <p className="mb-0" style={{ color: '#666', fontSize: '0.95rem', paddingRight: '90px', paddingBottom: '80px' }}>
                    De noche se almacena la energía para no coger de la red y así, ahorrar en las horas más caras.
                  </p>
                  
                  {/* Icono de casa con energía - lado derecho debajo del texto */}
                  <div className="position-absolute" style={{ bottom: '20px', right: '20px' }}>
                    <svg width="70" height="70" viewBox="0 0 24 24" fill="#A0D034">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      <circle cx="17" cy="7" r="1" fill="#A0D034"/>
                      <circle cx="19" cy="9" r="1" fill="#A0D034"/>
                      <path d="M16 6l1 1 1-1" stroke="#A0D034" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón COMPRAR centrado */}
            <div className="text-center">
              <button 
                className="btn btn-lg px-5 py-3 fw-bold text-white border-0 comprar-btn"
                style={{
                  background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                  borderRadius: '100px',
                  fontSize: '1.3rem',
                  minWidth: '250px'
                }}
                onClick={handleComprar}
              >
                COMPRAR
              </button>
            </div>
          </div>
        </div>

        {/* Sección: Ventajas Baterías EcoFlow */}
        <div className="container-fluid mt-5" style={{ maxWidth: '1200px' }}>
          {/* Título */}
          <div className="mb-5">
            <h3 className="fw-bold" style={{ color: '#A0D034', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              Ventajas
            </h3>
            <h2 className="fw-bold" style={{ color: '#2A2A2A', fontSize: '2.5rem', marginBottom: '0' }}>
              Baterías EcoFlow
            </h2>
          </div>

          {/* Las 3 ventajas */}
          <div className="row g-5 mb-5">
            {/* Ventaja 1 - Resiliencia ante crisis */}
            <div className="col-lg-4">
              <div className="text-center mb-4">
                {/* Icono circular verde */}
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    backgroundColor: '#A0D034'
                  }}
                >
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                    <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>
                  </svg>
                </div>
              </div>
              
              <h4 className="fw-bold mb-3" style={{ color: '#A0D034', fontSize: '1.5rem' }}>
                Resiliencia
              </h4>
              <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A', fontSize: '1.2rem' }}>
                ante crisis
              </h5>
              
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                La Comisión Europea recomienda que los ciudadanos estén preparados para posibles emergencias o <strong>cortes de suministro</strong>, disponiendo de provisiones esenciales para garantizar su autonomía durante un mínimo de 72 horas.
              </p>
            </div>

            {/* Ventaja 2 - Seguridad y autonomía energética */}
            <div className="col-lg-4">
              <div className="text-center mb-4">
                {/* Icono circular verde */}
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    backgroundColor: '#A0D034'
                  }}
                >
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M11,7H13V13H11V7M11,15H13V17H11V15Z"/>
                    <path d="M13 7L11 12H15L13 17" fill="white" transform="translate(-1,-2)"/>
                  </svg>
                </div>
              </div>
              
              <h4 className="fw-bold mb-3" style={{ color: '#A0D034', fontSize: '1.5rem' }}>
                Seguridad
              </h4>
              <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A', fontSize: '1.2rem' }}>
                y autonomía energética
              </h5>
              
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Contar con baterías en casa te permite <strong>almacenar energía</strong> de forma segura y garantizar el funcionamiento continuo de dispositivos esenciales en cortes o emergencias, <strong>reduciendo la dependencia de la red</strong> y mejorando el <strong>bienestar familiar</strong>.
              </p>
            </div>

            {/* Ventaja 3 - Ahorro desde el primer día */}
            <div className="col-lg-4">
              <div className="text-center mb-4">
                {/* Icono circular verde */}
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    backgroundColor: '#A0D034'
                  }}
                >
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
              </div>
              
              <h4 className="fw-bold mb-3" style={{ color: '#A0D034', fontSize: '1.5rem' }}>
                Ahorro
              </h4>
              <h5 className="fw-bold mb-3" style={{ color: '#2A2A2A', fontSize: '1.2rem' }}>
                desde el primer día
              </h5>
              
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Además de mejorar la seguridad, las baterías domésticas ayudan a <strong>optimizar el consumo eléctrico</strong>, almacenando energía en horas de bajo coste para utilizarla en momentos de mayor demanda, <strong>reduciendo así la factura de luz</strong>.
              </p>
            </div>
          </div>

          {/* Botón COMPRAR centrado */}
          <div className="text-center">
            <button 
              className="btn btn-lg px-5 py-3 fw-bold text-white border-0 comprar-btn"
              style={{
                background: 'linear-gradient(90deg, #5CA00E, #B0D83E)',
                borderRadius: '100px',
                fontSize: '1.3rem',
                minWidth: '250px'
              }}
              onClick={handleComprar}
            >
              COMPRAR
            </button>
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
          background: linear-gradient(90deg, #79BC1C, #FFAD2A, #4BCCE2);
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
          background: linear-gradient(90deg, #79BC1C, #FFB900, #4BCCE2);
          border-radius: 100px;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
        }
        
        .gradient-border-btn:hover::before {
          background: linear-gradient(90deg, #79BC1C, #FFB900, #4BCCE2);
        }
        
        /* Soporte para gradients de texto en navegadores */
        @supports (-webkit-background-clip: text) {
          .gradient-text {
            background: linear-gradient(90deg, #79BC1C, #B0D83E);
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
    </PageTransition>
  );
};

export default Propuesta;

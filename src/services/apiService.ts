// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://calculadora-baterias-api-20084454554.catalystserverless.eu/server/api';

// Importar estado FSM por defecto
import { DEFAULT_FSM_STATE } from '../types/fsmTypes';

// Tipo para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Función helper para hacer requests HTTP
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  
  // Limpiar endpoint (remover / inicial si existe)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // console.log('🌐 Haciendo request a:', cleanEndpoint);
  
  try {
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    // console.log('📡 Request URL:', url);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Intentar parsear JSON, pero manejar casos donde no sea JSON válido
    let data;
    try {
      data = await response.json();
    } catch {
      // Si no es JSON válido, usar el texto de la respuesta
      data = { message: await response.text() };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Error ${response.status}: ${response.statusText}`,
        data: data.data, // Preservar datos específicos para casos como contactoEncontrado: false
      };
    }

    // Adaptar la respuesta al formato esperado
    return {
      success: true,
      data: data.data || data, // Usar data.data si existe, sino data completo
      message: data.message
    };
  } catch (error) {
    console.error('Error en makeRequest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión con el servidor',
    };
  }
};

// Servicios específicos para comuneros
export const comuneroService = {
  // Crear comunero (maneja los 3 casos)
  async crearComunero(email: string, bypass?: boolean): Promise<ApiResponse<{ id: string; comunero: any }>> {
    const requestBody: any = { 
      email,
      fsmState: "01_IN_ZONE_LEAD"
    };
    if (bypass !== undefined) {
      requestBody.bypass = bypass;
    }
    
    return makeRequest('baterias/comunero', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  // Validar email de comunero y enviar código
  async validarEmail(email: string): Promise<ApiResponse<{ codigoEnviado: boolean }>> {
    return makeRequest('baterias/comunero/validar-email', {
      method: 'POST',
      body: JSON.stringify({ 
        email,
        fsmState: DEFAULT_FSM_STATE
      }),
    });
  },

  // Enviar código de validación usando propuestaId (para flujo de compra)
  async enviarCodigoPorPropuestaId(propuestaId: string, dni?: string): Promise<ApiResponse<{ codigoEnviado: boolean }>> {
    return makeRequest('baterias/comunero/enviar-codigo-por-propuesta', {
      method: 'POST',
      body: JSON.stringify({ 
        propuestaId,
        fsmState: DEFAULT_FSM_STATE,
        ...(dni && { dni: dni.trim().toUpperCase() })
      }),
    });
  },

  // Validar código de verificación
  async validarCodigo(codigo: string, email?: string): Promise<ApiResponse<{ 
    propuestaId?: string;
    token: string; 
    comunero: any; 
    enZona: "inZone" | "inZoneWithCost" | "outZone" | "NoCPAvailable"; 
    dealId?: string;
    motivo?: string;
    analisisTratos?: {
      tieneTratoCerradoGanado: boolean;
      hasInversor: {
        marca: string;
        modelo: string;
        numero: number | string;
      } | null;
      tratoGanadoBaterias: boolean;
      bateriaInicial: {
        modeloCapacidad: string;
      } | null;
      tieneAmpliacionBaterias: boolean;
      bateriaAmpliacion: any | null;
    };
  }>> {
    return makeRequest('baterias/comunero/validar-codigo', {
      method: 'POST',
      body: JSON.stringify({ 
        codigo, 
        email,
        fsmState: DEFAULT_FSM_STATE
      }),
    });
  },

  // Validar código para contratación (flujo de compra)
  async validarCodigoContratacion(codigo: string, propuestaId: string): Promise<ApiResponse<{ 
    codigoValido: boolean;
    propuestaId: string;
    token?: string;
  }>> {
    return makeRequest('baterias/comunero/validate-code-contratacion', {
      method: 'POST',
      body: JSON.stringify({ 
        codigo,
        propuestaId,
        fsmState: DEFAULT_FSM_STATE
      }),
    });
  },

  // Obtener URL de firma de contrato
  async obtenerUrlFirmaContrato(propuestaId: string): Promise<ApiResponse<{ 
    signUrl: string;
    propuestaId: string;
    status: string;
  }>> {
    return makeRequest(`baterias/comunero/get-sign-url/${propuestaId}`, {
      method: 'GET',
    });
  },

  // Editar información existente del comunero
  async editarInfoComunero(datosEdicion: {
    propuestaId: string;
    nombre: string;
    telefono: string;
    direccion: string;
    codigoPostal?: string;
    ciudad?: string;
    provincia?: string;
    token?: string;
    comuneroId?: string;
    fsmState?: string;
    mpkLogId?: string;
  }): Promise<ApiResponse<{ 
    propuestaId: string;
    updatedInfo: {
      nombre: string;
      telefono: string;
      direccion: string;
      ciudad?: string;
      codigoPostal?: string;
      provincia?: string;
      enZona?: "inZone" | "inZoneWithCost" | "outZone" | "NoCPAvailable";
    };
    lastUpdated: string;
  }>> {
    const payload: any = {
      ...datosEdicion,
      fsmState: datosEdicion.fsmState || DEFAULT_FSM_STATE
    };
    
    // Incluir mpkLogId en el payload si está disponible
    if (datosEdicion.mpkLogId) {
      payload.mpkLogId = datosEdicion.mpkLogId;
    }
    
    return makeRequest('baterias/comunero/edit-existing-info-comunero', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Servicios para nuevos comuneros
export const nuevoComuneroService = {
  // Crear nuevo comunero
  async crear(comuneroData: any, bypass?: boolean): Promise<ApiResponse<{ id: string; comunero: any }>> {
    const requestBody = { 
      ...comuneroData,
      fsmState: comuneroData.fsmState || "01_IN_ZONE_LEAD"
    };
    if (bypass !== undefined) {
      requestBody.bypass = bypass;
    }
    
    return makeRequest('baterias/comunero', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },
  
  // Obtener datos actualizados después de validación de código
  async obtenerDatosActualizadosPostValidacion(propuestaId: string): Promise<ApiResponse<{
    comuneroActualizado: {
      id: string;
      nombre: string;
      email: string;
      telefono: string;
      direccion: string;
      codigoPostal: string;
      ciudad: string;
      provincia: string;
      enZona?: 'inZone' | 'inZoneWithCost' | 'outZone';
      campaignSource?: string;
      fsmState?: string;
    } | null;
    fuenteDatos: 'base_datos' | 'sin_cambios';
    fechaActualizacion?: string;
    mensaje?: string;
  }>> {
    return makeRequest(`baterias/comunero/just-created-after-code-validation/${propuestaId}`, {
      method: 'GET',
    });
  },

  // Obtener datos de comunero por ID único
  async obtenerPorId(clienteId: string): Promise<ApiResponse<{
    mpk_log_id: string;
    contact_id: string;
    deal_id: string;
    fsmState: string;
    data: {
      comunero: {
        id: string;
        nombre: string;
        email: string;
        telefono: string;
        direccion: string;
        codigoPostal: string;
        ciudad: string;
        provincia: string;
      };
      token: string;
      enZona: "inZone" | "inZoneWithCost" | "outZone";
      propuestaId: string;
      dealId: string;
      analisisTratos: {
        tieneTratoCerradoGanado: boolean;
        hasInversor: {
          marca: string;
          modelo: string;
          numero: number;
        };
        tratoGanadoBaterias: boolean;
        bateriaInicial: {
          modeloCapacidad: string;
        };
        tieneAmpliacionBaterias: boolean;
        bateriaAmpliacion: any | null;
      };
      respuestasPreguntas: {
        tieneInstalacionFV: boolean | null;
        tieneInversorHuawei: string;
        tipoInversorHuawei: string;
        tipoInstalacion: string;
        tipoCuadroElectrico: string;
        tieneBaterias: boolean | null;
        tipoBaterias: string;
        capacidadCanadian: string;
        capacidadHuawei: string;
        instalacionCerca10m: boolean | null;
        metrosExtra: string;
        requiereContactoManual: boolean;
      };
    };
  }>> {
    return makeRequest(`baterias/comunero/${clienteId}`, {
      method: 'GET',
    });
  },
};

// Servicios para baterías
export const bateriaService = {
  // Crear solicitud de contacto manual para usuarios que desconocen su unidad
  async contactarAsesorDesconoceUnidad(datosCompletos: {
    // Identificador global principal
    propuestaId: string; // ID global de la propuesta
    
    // Datos principales requeridos
    contactId?: string; // ID del comunero si existe (opcional)
    email: string;
    
    // Datos de preguntas adicionales
    tieneInstalacionFV: boolean;
    tipoInstalacion?: string;
    tipoCuadroElectrico?: string;
    requiereContactoManual: boolean;
    
    // Foto del disyuntor para análisis por IA (opcional)
    fotoDisyuntor?: string;
    
    // Datos adicionales del usuario para contexto
    nombre?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    
    // Datos de validación
    token?: string;
    dealId?: string; // Mantener por compatibilidad
    enZona?: string;
    fsmState?: string;
  }): Promise<ApiResponse<{ id: string; solicitud: any }>> {
    return makeRequest('baterias/comunero/desconoce-unidad/contactar-asesor', {
      method: 'POST',
      body: JSON.stringify({
        ...datosCompletos,
        fsmState: datosCompletos.fsmState || DEFAULT_FSM_STATE
      }),
    });
  },

  // Solicitar visita técnica desde la propuesta
  async solicitarVisitaTecnica(datosCompletos: {
    // Identificador global principal
    propuestaId: string; // ID global de la propuesta
    
    // Datos principales requeridos
    contactId?: string; // ID del comunero si existe (opcional)
    email: string;
    
    // Datos adicionales del usuario para contexto
    nombre?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    
    // Datos de validación
    token?: string;
    dealId?: string; // Mantener por compatibilidad
    enZona?: string;
    fsmState?: string;
    
    // Tipo de solicitud
    tipoSolicitud: 'visita_tecnica';
    motivo?: string;
  }): Promise<ApiResponse<{ 
    paymentLink?: string; 
    databaseId?: string; 
    fsmState?: string; 
    fsmPrevious?: string; 
    lastUpdated?: string; 
    id?: string; 
    solicitud?: any; 
    type?: string;
  }>> {
    return makeRequest('baterias/comunero/solicitar-visita-tecnica', {
      method: 'POST',
      body: JSON.stringify({
        ...datosCompletos,
        fsmState: datosCompletos.fsmState || DEFAULT_FSM_STATE
      }),
    });
  },

  // Solicitud para instalación dentro de 10m en zona (inZone)
  async solicitudInZoneDentro10m(datosCompletos: {
    // Identificador global principal
    propuestaId: string; // ID global de la propuesta
    
    // Datos principales requeridos
    contactId?: string;
    email: string;
    
    // Datos de preguntas adicionales
    tieneInstalacionFV: boolean;
    tipoInstalacion: string;
    tieneBaterias: boolean;
    instalacionCerca10m: boolean;
    
    // Estado FSM
    fsmState?: string;
    
    // Datos adicionales del usuario para contexto
    nombre?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    
    // Datos de validación
    token?: string;
    dealId?: string; // Mantener por compatibilidad
    enZona?: string;
  }): Promise<ApiResponse<{ id: string; propuesta: any }>> {
    return makeRequest('baterias/comunero/create-proposal', {
      method: 'POST',
      body: JSON.stringify({
        ...datosCompletos,
        fsmState: datosCompletos.fsmState || DEFAULT_FSM_STATE
      }),
    });
  },

  // Análisis de foto de disyuntor por IA
  async analizarFotoDisyuntor(fotoData: {
    // Identificador global principal
    propuestaId: string; // ID global de la propuesta
    
    // Datos principales requeridos
    contactId?: string;
    email: string;
    
    // Archivo de imagen
    fotoDisyuntor: File;
    
    // Datos adicionales para contexto
    nombre?: string;
    telefono?: string;
    token?: string;
    dealId?: string; // Mantener por compatibilidad
    fsmState?: string;
  }): Promise<ApiResponse<{ 
    propuestaId: string;
    analisisDisyuntor: {
      tipoInstalacion: 'MONOFASICO' | 'TRIFASICO';
      descripcion: string;
      confianza: 'alta' | 'media' | 'baja';
    };
    fechaAnalisis: string;
  }>> {
    // Crear FormData para envío de archivo
    const formData = new FormData();
    formData.append('fotoDisyuntor', fotoData.fotoDisyuntor);
    formData.append('propuestaId', fotoData.propuestaId); // ID global principal
    formData.append('email', fotoData.email);
    
    if (fotoData.contactId) formData.append('contactId', fotoData.contactId);
    if (fotoData.dealId) formData.append('dealId', fotoData.dealId);
    if (fotoData.nombre) formData.append('nombre', fotoData.nombre);
    if (fotoData.telefono) formData.append('telefono', fotoData.telefono);
    if (fotoData.token) formData.append('token', fotoData.token);
    
    // Agregar fsmState
    formData.append('fsmState', fotoData.fsmState || DEFAULT_FSM_STATE);
    
    // Hacer request sin JSON, usando FormData
    const cleanEndpoint = 'baterias/comunero/analizar-disyuntor';
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    
    try {
      // console.log('📤 Enviando foto para análisis de IA:', {
      //   endpoint: cleanEndpoint,
      //   propuestaId: fotoData.propuestaId,
      //   archivo: fotoData.fotoDisyuntor.name,
      //   tamano: fotoData.fotoDisyuntor.size
      // });
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData, // No incluir Content-Type header, fetch lo manejará automáticamente
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error('Error en análisis de foto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar la imagen',
      };
    }
  },

  // Crear solicitud de propuesta automatizada (caso normal)
  async crearSolicitud(datosCompletos: {
    // Identificador global principal
    propuestaId: string; // ID global de la propuesta
    
    // Datos del usuario
    contactId?: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    // Datos técnicos del formulario
    tieneInstalacionFV: boolean;
    tipoInstalacion?: string;
    tieneInversorHuawei?: string;
    tipoInversorHuawei?: string;
    tipoCuadroElectrico?: string;
    requiereContactoManual: boolean;
    // Datos de validación
    token?: string;
    dealId?: string; // Mantener por compatibilidad
    enZona?: string;
    fsmState?: string;
  }): Promise<ApiResponse<{ id: string; solicitud: any; propuestaId: string }>> {
    return makeRequest('baterias/comunero/create-proposal', {
      method: 'POST',
      body: JSON.stringify({
        ...datosCompletos,
        fsmState: datosCompletos.fsmState || DEFAULT_FSM_STATE
      }),
    });
  },

  // Obtener información del deal por ID
  async obtenerDealPorId(dealId: string): Promise<ApiResponse<any>> {
    // console.log('📋 Obteniendo información del deal:', dealId);
    return makeRequest(`baterias/deal/${dealId}`, {
      method: 'GET',
    });
  },

  // Generar enlace de pago para reserva
  async generarEnlacePago(datos: {
    propuestaId: string;
    dni: string;
    name: string;
    lastname: string;
    mpkLogId?: string;
    email?: string;
  }): Promise<ApiResponse<{
    paymentURL: string;
    propuestaId: string;
    invoiceId: string;
  }>> {
    // console.log('💳 Generando enlace de pago para reserva:', datos);
    return makeRequest('baterias/reserva/enlace-de-pago', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  // Verificar estado del pago
  async verificarEstadoPago(propuestaId: string): Promise<ApiResponse<{
    status: 'pending' | 'processing' | 'success' | 'failed';
    invoiceId?: string;
    paymentDetails?: any;
  }>> {
    // console.log('🔍 Verificando estado de pago para propuesta:', propuestaId);
    return makeRequest(`baterias/reserva/estado-pago/${propuestaId}`, {
      method: 'GET',
    });
  },

  // Procesar pago exitoso de visita técnica
  async procesarVisitaTecnicaPagada(propuestaId: string): Promise<ApiResponse<{
    success: boolean;
    message?: string;
    propuestaId: string;
  }>> {
    // console.log('✅ Procesando pago de visita técnica para propuesta:', propuestaId);
    return makeRequest('baterias/comunero/visita-tecnica-pagada/contrata', {
      method: 'POST',
      body: JSON.stringify({ propuestaId }),
    });
  },

  // Procesar pago exitoso de baterías
  async procesarBateriasPagadas(propuestaId: string): Promise<ApiResponse<{
    success: boolean;
    message?: string;
    propuestaId: string;
  }>> {
    // console.log('✅ Procesando pago de baterías para propuesta:', propuestaId);
    return makeRequest('baterias/comunero/baterias-pagadas/contrata', {
      method: 'POST',
      body: JSON.stringify({ propuestaId }),
    });
  },

  // Procesar pago exitoso de reserva/visita técnica
  async procesarFaseReservaPagado(propuestaId: string, type: string): Promise<ApiResponse<{
    success: boolean;
    message?: string;
    propuestaId: string;
    type: string;
  }>> {
    // console.log('✅ Procesando fase reserva pagada para propuesta:', propuestaId, 'type:', type);
    return makeRequest(`baterias/comunero/fase-reserva/pagado/${type}`, {
      method: 'POST',
      body: JSON.stringify({ propuestaId }),
    });
  },
};

export default {
  comuneroService,
  nuevoComuneroService,
  bateriaService,
};

// Exportar funciones helper FSM
export { getFSMStateForRequest } from '../types/fsmTypes';

// Hook personalizado para usar en componentes React (debe importarse en el componente)
// NOTA: Este debe ser usado dentro de un componente React, no como función standalone
export const createCargarComuneroHook = () => {
  // Esta función debe ser llamada dentro de un componente para acceder a los hooks
  const cargarComuneroConNavegacion = async (
    clienteId: string, 
    formStore: any, 
    navigate: (path: string) => void
  ) => {
    const resultado = await cargarComuneroPorId(clienteId, formStore);
    
    if (resultado.success && resultado.datosGuardados) {
      // console.log(`🧭 Navegando automáticamente a: ${resultado.rutaNavegacion}`);
      navigate(resultado.rutaNavegacion);
      return { 
        success: true, 
        fsmState: resultado.fsmState,
        ruta: resultado.rutaNavegacion 
      };
    } else if (resultado.success) {
      console.warn(`⚠️ fsmState ${resultado.fsmState} no implementado, navegación manual requerida`);
      return { 
        success: true, 
        fsmState: resultado.fsmState,
        ruta: resultado.rutaNavegacion,
        requiresManualProcessing: true
      };
    }
    
    return { 
      success: false, 
      error: resultado.error,
      fsmState: null,
      ruta: '/home'
    };
  };
  
  return { cargarComuneroConNavegacion };
};

// Helper function para procesar la respuesta de obtenerPorId y cargarla en el form store
export const procesarRespuestaComunero = (respuesta: any) => {
  if (!respuesta.success || !respuesta.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  const { data } = respuesta;
  const { fsmState, data: comuneroData } = data;

  // Preparar datos para el form store
  const datosParaStore = {
    // Datos básicos del formulario
    nombre: comuneroData.comunero.nombre || '',
    mail: comuneroData.comunero.email || '',
    telefono: comuneroData.comunero.telefono || '',
    direccion: comuneroData.comunero.direccion || '',
    codigoPostal: comuneroData.comunero.codigoPostal || '',
    ciudad: comuneroData.comunero.ciudad || '',
    provincia: comuneroData.comunero.provincia || '',
    
    // Estado FSM
    fsmState: fsmState,
    
    // Datos de validación
    token: comuneroData.token,
    enZona: comuneroData.enZona,
    propuestaId: comuneroData.propuestaId,
    dealId: comuneroData.dealId,
    
    // Datos del comunero
    comunero: {
      id: comuneroData.comunero.id,
      nombre: comuneroData.comunero.nombre,
      email: comuneroData.comunero.email,
      telefono: comuneroData.comunero.telefono,
      direccion: comuneroData.comunero.direccion,
      codigoPostal: comuneroData.comunero.codigoPostal,
      ciudad: comuneroData.comunero.ciudad,
      provincia: comuneroData.comunero.provincia,
    },
    
    // Análisis de tratos
    analisisTratos: comuneroData.analisisTratos,
    
    // Respuestas a preguntas
    respuestasPreguntas: comuneroData.respuestasPreguntas || {},
  };

  // console.log('📋 Datos procesados para el store:', datosParaStore);
  
  return {
    datosParaStore,
    fsmState,
    rawResponse: data
  };
};

// Helper function para procesar respuesta de propuesta contratada (fsmState: "12_CONTRATA")
export const procesarRespuestaContratada = (respuesta: any) => {
  if (!respuesta.success || !respuesta.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  const { data } = respuesta;
  const { fsmState, data: propuestaData } = data;

  // Estructura esperada para propuesta contratada
  const datosContratada = {
    fsmState: fsmState,
    propuesta: {
      id: propuestaData.propuesta?.id || propuestaData.propuestaId,
      estado: propuestaData.propuesta?.estado || 'Contrato Generado - Esperando Firma',
      producto: {
        nombre: propuestaData.propuesta?.producto?.nombre || propuestaData.producto?.nombre || 'Batería Solar',
        modelo: propuestaData.propuesta?.producto?.modelo || propuestaData.producto?.modelo || '',
        capacidad: propuestaData.propuesta?.producto?.capacidad || propuestaData.producto?.capacidad || '',
        precio: propuestaData.propuesta?.producto?.precio || propuestaData.producto?.precio || 0,
        moneda: propuestaData.propuesta?.producto?.moneda || propuestaData.producto?.moneda || 'EUR'
      },
      fechaContratacion: propuestaData.propuesta?.fechaGeneracion || propuestaData.fechaGeneracion || propuestaData.propuesta?.fechaContratacion || propuestaData.fechaContratacion || new Date().toISOString(),
      numeroContrato: propuestaData.propuesta?.numeroContrato || propuestaData.numeroContrato
    },
    comunero: {
      nombre: propuestaData.comunero?.nombre || '',
      email: propuestaData.comunero?.email || '',
      telefono: propuestaData.comunero?.telefono || ''
    }
  };

  // console.log('📋 Datos procesados para propuesta contratada:', datosContratada);
  
  return {
    datosContratada,
    fsmState,
    rawResponse: data
  };
};

// Helper function para procesar respuesta de visita técnica (fsmState: "06_VISITA_TECNICA")
export const procesarRespuestaVisitaTecnica = (respuesta: any) => {
  // console.log('🔧 Procesando respuesta de visita técnica:', respuesta);
  
  const data = respuesta.data;
  
  // Estructura de datos para la propuesta post-visita técnica (similar a 04_DATOS_RECOGIDOS)
  const datosPropuesta = {
    fsmState: '06_VISITA_TECNICA',
    propuestaData: {
      amount: data.propuestaData?.amount || 4699,
      productData: {
        name: data.propuestaData?.productData?.name || 'Pack Batería EcoFlow 5 kWh',
        group_name: data.propuestaData?.productData?.group_name || 'Pack Batería Trifásico EcoFlow 5 kWh con Inversor de 12 kW',
        mapped_items: data.propuestaData?.productData?.mapped_items || []
      },
      usuario: {
        nombre: data.comunero?.nombre || '',
        email: data.comunero?.email || '',
        direccion: {
          calle: data.comunero?.direccion || '',
          ciudad: data.comunero?.ciudad || '',
          provincia: data.comunero?.provincia || '',
          codigoPostal: data.comunero?.codigoPostal || ''
        }
      },
      conditions: {
        enZona: data.enZona || 'inZone'
      },
      propuestaId: data.propuestaData?.propuestaId
    },
    // Datos del comunero para el store
    comunero: {
      id: data.comunero?.id || '',
      nombre: data.comunero?.nombre || '',
      email: data.comunero?.email || '',
      telefono: data.comunero?.telefono || '',
      direccion: data.comunero?.direccion || '',
      codigoPostal: data.comunero?.codigoPostal || '',
      ciudad: data.comunero?.ciudad || '',
      provincia: data.comunero?.provincia || ''
    },
    token: data.token,
    enZona: data.enZona,
    propuestaId: data.propuestaData?.propuestaId,
    
    // Indicador simple: la visita técnica está completada
    visitaTecnicaCompletada: true,
    tipoInstalacion: data.respuestasPreguntas?.tipoInstalacion || 'trifasica'
  };
  
  return {
    fsmState: '06_VISITA_TECNICA',
    datosPropuesta,
    tipoRespuesta: 'visita-tecnica'
  };
};

// Helper function para procesar respuesta de propuesta generada (fsmState: "04_DATOS_RECOGIDOS")
export const procesarRespuestaPropuestaGenerada = (respuesta: any) => {
  if (!respuesta.success || !respuesta.data) {
    throw new Error('Respuesta inválida del servidor');
  }

  const { data } = respuesta;
  const { fsmState, data: propuestaData } = data;

  // Estructura esperada para propuesta generada
  const datosPropuesta = {
    fsmState: fsmState,
    propuestaData: {
      amount: propuestaData.propuesta?.precio || propuestaData.amount || 4699,
      productData: {
        name: propuestaData.propuesta?.nombre || propuestaData.productData?.name || 'Pack Batería EcoFlow 5 kWh',
        group_name: propuestaData.propuesta?.grupo || propuestaData.productData?.group_name || 'Pack Batería Monofásico EcoFlow 5 kWh con Inversor de 12 kW',
        mapped_items: propuestaData.propuesta?.items || propuestaData.productData?.mapped_items || [
          { name: "Pack Baterías EcoFlow 5 kWh" },
          { name: "1x EcoFlow PowerOcean LFP Battery 5kWh" },
          { name: "1x Inversor Híbrido EcoFlow PowerOcean DC Fit 12kW" }
        ]
      },
      usuario: {
        nombre: propuestaData.comunero?.nombre || '',
        email: propuestaData.comunero?.email || '',
        direccion: {
          calle: propuestaData.comunero?.direccion || '',
          ciudad: propuestaData.comunero?.ciudad || '',
          provincia: propuestaData.comunero?.provincia || '',
          codigoPostal: propuestaData.comunero?.codigoPostal || ''
        }
      },
      conditions: {
        enZona: propuestaData.enZona || 'inZone'
      },
      propuestaId: propuestaData.propuestaId
    },
    // Datos del comunero para el store
    comunero: {
      id: propuestaData.comunero?.id || '',
      nombre: propuestaData.comunero?.nombre || '',
      email: propuestaData.comunero?.email || '',
      telefono: propuestaData.comunero?.telefono || '',
      direccion: propuestaData.comunero?.direccion || '',
      codigoPostal: propuestaData.comunero?.codigoPostal || '',
      ciudad: propuestaData.comunero?.ciudad || '',
      provincia: propuestaData.comunero?.provincia || ''
    },
    token: propuestaData.token,
    enZona: propuestaData.enZona,
    propuestaId: propuestaData.propuestaId
  };

  // console.log('📋 Datos procesados para propuesta generada:', datosPropuesta);
  
  return {
    datosPropuesta,
    fsmState,
    rawResponse: data
  };
};

// Helper function para determinar la ruta/vista basada en el fsmState
export const obtenerRutaPorFsmState = (fsmState: string): string => {
  const rutasPorEstado: Record<string, string> = {
    'initial': '/home',
    '01_IN_ZONE_LEAD': '/preguntas-adicionales',
    '01_DENTRO_ZONA': '/preguntas-adicionales', // Mapeo para nueva nomenclatura del backend
    '02_IN_ZONE_WITH_COST': '/preguntas-adicionales', // Podría ser una vista diferente
    '03_OUT_ZONE': '/fuera-zona', // Vista para usuarios fuera de zona
    '04_DATOS_RECOGIDOS': '/propuesta', // Vista de propuesta generada
    '04_MONO_DESCONOCE_A': '/preguntas-adicionales',
    '05_MONO_DESCONOCE_M': '/preguntas-adicionales', 
    '06_TRI_DESCONOCE_A': '/preguntas-adicionales',
    '06_VISITA_TECNICA': '/propuesta', // Propuesta post-visita técnica
    '07_TRI_DESCONOCE_M': '/preguntas-adicionales',
    '12_CONTRATA': '/propuesta-contratada', // Nueva vista para propuestas contratadas
    // Agregar más estados según se definan
  };

  const ruta = rutasPorEstado[fsmState];
  
  if (!ruta) {
    console.warn(`⚠️ No se encontró ruta para fsmState: ${fsmState}, usando /home por defecto`);
    return '/home';
  }

  // console.log(`🧭 Navegando a: ${ruta} para fsmState: ${fsmState}`);
  return ruta;
};

// Helper function para cargar un comunero por ID y preparar la navegación
// IMPORTANTE: Esta función debe ser llamada desde un componente React para acceder al store
export const cargarComuneroPorId = async (clienteId: string, useFormStore?: any) => {
  try {
    // console.log(`🔍 Cargando comunero con ID: ${clienteId}`);
    
    // Obtener datos del comunero
    const respuesta = await nuevoComuneroService.obtenerPorId(clienteId);
    
    if (!respuesta.success) {
      throw new Error(respuesta.error || 'Error al obtener datos del comunero');
    }

    // Procesar la respuesta según el fsmState
    const { fsmState } = respuesta.data!; // El ! es seguro porque ya verificamos success
    
    let datosParaStore;
    let rutaNavegacion;
    
    // Procesar según el estado FSM
    if (fsmState === '01_IN_ZONE_LEAD' || fsmState === '01_DENTRO_ZONA') {
      const procesado = procesarRespuestaComunero(respuesta);
      datosParaStore = procesado.datosParaStore;
      rutaNavegacion = obtenerRutaPorFsmState(fsmState);
      
      // Si se proporciona el store, cargar los datos automáticamente
      if (useFormStore) {
        // console.log('💾 Cargando datos en Zustand store...');
        
        // Cargar datos básicos
        const { setField, setValidacionData, setRespuestasPreguntas, setFsmState } = useFormStore;
        
        // Datos básicos del formulario
        setField('nombre', datosParaStore.nombre);
        setField('mail', datosParaStore.mail);
        setField('telefono', datosParaStore.telefono);
        setField('direccion', datosParaStore.direccion);
        setField('codigoPostal', datosParaStore.codigoPostal);
        setField('ciudad', datosParaStore.ciudad);
        setField('provincia', datosParaStore.provincia);
        
        // Estado FSM - normalizar a la nomenclatura interna
        const fsmStateNormalizado = fsmState === '01_DENTRO_ZONA' ? '01_IN_ZONE_LEAD' : fsmState;
        setFsmState(fsmStateNormalizado);
        
        // Datos de validación completos
        setValidacionData({
          token: datosParaStore.token,
          comunero: datosParaStore.comunero,
          enZona: datosParaStore.enZona,
          propuestaId: datosParaStore.propuestaId,
          dealId: datosParaStore.dealId,
          analisisTratos: datosParaStore.analisisTratos
        });
        
        // Respuestas a preguntas previas
        setRespuestasPreguntas(datosParaStore.respuestasPreguntas);
        
        // console.log('✅ Datos cargados en Zustand:', {
        //   fsmState: fsmStateNormalizado,
        //   comunero: datosParaStore.comunero.nombre,
        //   respuestas: Object.keys(datosParaStore.respuestasPreguntas)
        // });
      }
    } else if (fsmState === '04_DATOS_RECOGIDOS') {
      const procesado = procesarRespuestaPropuestaGenerada(respuesta);
      datosParaStore = procesado.datosPropuesta;
      rutaNavegacion = 'propuesta-generada'; // Ruta especial para renderizar propuesta
      
      // También cargar datos básicos del comunero en el store si se proporciona
      if (useFormStore && procesado.datosPropuesta.comunero) {
        // console.log('💾 Cargando datos del comunero en Zustand store...');
        const { setField, setValidacionData, setFsmState } = useFormStore;
        
        // Datos básicos del formulario
        setField('nombre', procesado.datosPropuesta.comunero.nombre);
        setField('mail', procesado.datosPropuesta.comunero.email);
        setField('telefono', procesado.datosPropuesta.comunero.telefono);
        setField('direccion', procesado.datosPropuesta.comunero.direccion);
        setField('codigoPostal', procesado.datosPropuesta.comunero.codigoPostal);
        setField('ciudad', procesado.datosPropuesta.comunero.ciudad);
        setField('provincia', procesado.datosPropuesta.comunero.provincia);
        
        // Estado FSM
        setFsmState(fsmState);
        
        // Datos de validación
        setValidacionData({
          token: procesado.datosPropuesta.token || '',
          comunero: procesado.datosPropuesta.comunero,
          enZona: procesado.datosPropuesta.enZona || 'inZone',
          propuestaId: procesado.datosPropuesta.propuestaId
        });
      }
      
      // console.log('✅ Datos de propuesta generada procesados:', {
      //   fsmState: procesado.fsmState,
      //   propuestaId: procesado.datosPropuesta.propuestaId,
      //   precio: procesado.datosPropuesta.propuestaData.amount,
      //   producto: procesado.datosPropuesta.propuestaData.productData.name
      // });
    } else if (fsmState === '12_CONTRATA') {
      const procesado = procesarRespuestaContratada(respuesta);
      datosParaStore = procesado.datosContratada;
      rutaNavegacion = 'propuesta-contratada'; // Ruta especial para renderizar en el mismo componente
      
      // console.log('✅ Datos de propuesta contratada procesados:', {
      //   fsmState: procesado.fsmState,
      //   propuesta: procesado.datosContratada.propuesta.id,
      //   producto: procesado.datosContratada.propuesta.producto.nombre
      // });
    } else if (fsmState === '06_VISITA_TECNICA') {
      const procesado = procesarRespuestaVisitaTecnica(respuesta);
      datosParaStore = procesado.datosPropuesta;
      rutaNavegacion = 'propuesta-visita-tecnica'; // Ruta especial para renderizar propuesta post-visita
      
      // También cargar datos básicos del comunero en el store si se proporciona
      if (useFormStore && procesado.datosPropuesta.comunero) {
        // console.log('💾 Cargando datos del comunero post-visita técnica en Zustand store...');
        const { setField, setValidacionData, setFsmState } = useFormStore;
        
        // Datos básicos del formulario
        setField('nombre', procesado.datosPropuesta.comunero.nombre);
        setField('mail', procesado.datosPropuesta.comunero.email);
        setField('telefono', procesado.datosPropuesta.comunero.telefono);
        setField('direccion', procesado.datosPropuesta.comunero.direccion);
        setField('codigoPostal', procesado.datosPropuesta.comunero.codigoPostal);
        setField('ciudad', procesado.datosPropuesta.comunero.ciudad);
        setField('provincia', procesado.datosPropuesta.comunero.provincia);
        
        // Estado FSM
        setFsmState(fsmState);
        
        // Datos de validación
        setValidacionData({
          token: procesado.datosPropuesta.token || '',
          comunero: procesado.datosPropuesta.comunero,
          enZona: procesado.datosPropuesta.enZona || 'inZone',
          propuestaId: procesado.datosPropuesta.propuestaId
        });
      }
      
      // console.log('✅ Datos de visita técnica procesados:', {
      //   fsmState: procesado.fsmState,
      //   propuestaId: procesado.datosPropuesta.propuestaId,
      //   visitaCompletada: procesado.datosPropuesta.visitaTecnicaCompletada,
      //   tipoInstalacion: procesado.datosPropuesta.tipoInstalacion
      // });
    } else if (fsmState === '17_RESERVA_PAGADA') {
      // Para fsmState "17_RESERVA_PAGADA", procesar la propuesta completa que viene del backend
      const rawData = respuesta.data!.data as any; // Cast para acceder a la nueva estructura
      
      // Crear propuestaData usando la estructura que espera el componente Propuesta
      const propuestaData = {
        amount: rawData.propuesta.precio,
        productData: {
          name: rawData.propuesta.nombre,
          group_name: rawData.propuesta.grupo,
          mapped_items: rawData.propuesta.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            rate: item.rate
          }))
        }
      };
      
      datosParaStore = {
        fsmState: fsmState,
        propuestaData: propuestaData,
        comunero: rawData.comunero,
        token: rawData.token,
        enZona: rawData.enZona,
        propuestaId: rawData.propuestaId,
        reservaPagada: true
      };
      
      rutaNavegacion = 'propuesta-reserva-pagada'; // Ruta especial para renderizar propuesta sin botones
      
      // También cargar datos básicos del comunero en el store si se proporciona
      if (useFormStore && rawData.comunero) {
        // console.log('💾 Cargando datos del comunero con reserva pagada en Zustand store...');
        const { setField, setValidacionData, setFsmState } = useFormStore;
        
        // Datos básicos del formulario
        setField('nombre', rawData.comunero.nombre);
        setField('mail', rawData.comunero.email);
        setField('telefono', rawData.comunero.telefono);
        setField('direccion', rawData.comunero.direccion);
        setField('codigoPostal', rawData.comunero.codigoPostal);
        setField('ciudad', rawData.comunero.ciudad);
        setField('provincia', rawData.comunero.provincia);
        
        // Estado FSM
        setFsmState(fsmState);
        
        // Datos de validación
        setValidacionData({
          token: rawData.token || '',
          comunero: rawData.comunero,
          enZona: rawData.enZona || 'inZone',
          propuestaId: rawData.propuestaId
        });
      }
      
      // console.log('✅ Datos de reserva pagada procesados:', {
      //   fsmState: fsmState,
      //   propuestaId: rawData.propuestaId,
      //   comunero: rawData.comunero.nombre,
      //   precio: rawData.propuesta.precio,
      //   producto: rawData.propuesta.nombre,
      //   reservaPagada: true
      // });
    } else if (fsmState === '07_VISITA_PAGADA') {
      // Para fsmState "07_VISITA_PAGADA", procesar igual que reserva pagada
      const rawData = respuesta.data!.data as any;
      
      // Crear propuestaData usando la estructura que espera el componente Propuesta
      const propuestaData = {
        amount: rawData.propuesta.precio,
        productData: {
          name: rawData.propuesta.nombre,
          group_name: rawData.propuesta.grupo,
          mapped_items: rawData.propuesta.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            rate: item.rate
          }))
        }
      };
      
      datosParaStore = {
        fsmState: fsmState,
        propuestaData: propuestaData,
        comunero: rawData.comunero,
        token: rawData.token,
        enZona: rawData.enZona,
        propuestaId: rawData.propuestaId,
        visitaPagada: true // Usamos visitaPagada en lugar de reservaPagada
      };
      
      rutaNavegacion = 'propuesta-visita-pagada'; // Ruta especial para renderizar propuesta sin botones
      
      // También cargar datos básicos del comunero en el store si se proporciona
      if (useFormStore && rawData.comunero) {
        // console.log('💾 Cargando datos del comunero con visita pagada en Zustand store...');
        const { setField, setValidacionData, setFsmState } = useFormStore;
        
        // Datos básicos del formulario
        setField('nombre', rawData.comunero.nombre);
        setField('mail', rawData.comunero.email);
        setField('telefono', rawData.comunero.telefono);
        setField('direccion', rawData.comunero.direccion);
        setField('codigoPostal', rawData.comunero.codigoPostal);
        setField('ciudad', rawData.comunero.ciudad);
        setField('provincia', rawData.comunero.provincia);
        
        // Estado FSM
        setFsmState(fsmState);
        
        // Datos de validación
        setValidacionData({
          token: rawData.token || '',
          comunero: rawData.comunero,
          enZona: rawData.enZona || 'inZone',
          propuestaId: rawData.propuestaId
        });
      }
      
      // console.log('✅ Datos de visita pagada procesados:', {
      //   fsmState: fsmState,
      //   propuestaId: rawData.propuestaId,
      //   comunero: rawData.comunero.nombre,
      //   precio: rawData.propuesta.precio,
      //   producto: rawData.propuesta.nombre,
      //   visitaPagada: true
      // });
    } else {
      // Para otros estados FSM, implementar según sea necesario
      console.warn(`⚠️ Estado FSM ${fsmState} no implementado aún`);
      datosParaStore = null;
      rutaNavegacion = obtenerRutaPorFsmState(fsmState);
    }
    
    return {
      success: true,
      datosParaStore,
      fsmState,
      rutaNavegacion,
      rawResponse: respuesta.data,
      datosGuardados: !!useFormStore // Indica si se guardaron en el store
    };
    
  } catch (error) {
    console.error('❌ Error al cargar comunero:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      datosParaStore: null,
      fsmState: null,
      rutaNavegacion: '/home',
      datosGuardados: false
    };
  }
};

/*
EJEMPLO DE USO ACTUALIZADO:

// En un componente React
import { cargarComuneroPorId } from '../services/apiService';
import { useFormStore } from '../zustand/formStore';
import { useNavigate } from 'react-router-dom';

const MiComponente = () => {
  const navigate = useNavigate();
  const formStore = useFormStore(); // Obtener todo el store
  
  const cargarCliente = async (clienteId: string) => {
    // Opción 1: Cargar automáticamente en el store
    const resultado = await cargarComuneroPorId(clienteId, formStore);
    
    if (resultado.success && resultado.datosGuardados) {
      console.log('✅ Datos cargados automáticamente en Zustand');
      // Navegar a la vista correcta
      navigate(resultado.rutaNavegacion);
    } else if (resultado.success) {
      console.log('⚠️ Datos obtenidos pero no guardados (fsmState no implementado)');
      // Manejar caso donde el fsmState no está implementado
    } else {
      console.error('❌ Error:', resultado.error);
    }
    
    // Opción 2: Solo obtener datos sin guardar
    // const resultado = await cargarComuneroPorId(clienteId);
    // Luego procesar manualmente los datos si se necesita lógica custom
  };
};

// ALTERNATIVA: Hook personalizado para simplificar el uso
export const useCargarComunero = () => {
  const navigate = useNavigate();
  const formStore = useFormStore();
  
  const cargarComunero = async (clienteId: string) => {
    const resultado = await cargarComuneroPorId(clienteId, formStore);
    
    if (resultado.success && resultado.datosGuardados) {
      navigate(resultado.rutaNavegacion);
      return { success: true, fsmState: resultado.fsmState };
    }
    
    return { success: false, error: resultado.error };
  };
  
  return { cargarComunero };
};

RESPUESTA ESPERADA del backend para fsmState "01_IN_ZONE_LEAD":
{
  "success": true,
  "data": {
    "id": "...",
    "fsmState": "01_IN_ZONE_LEAD",
    "data": {
      "comunero": { ... },
      "token": "...",
      "enZona": "inZone",
      "propuestaId": "...",
      "dealId": "...",
      "analisisTratos": { ... },
      "respuestasPreguntas": { ... }
    }
  }
}

RESPUESTA ESPERADA del backend para fsmState "01_DENTRO_ZONA":
{
  "success": true,
  "data": {
    "mpk_log_id": "string",
    "contact_id": "string", 
    "deal_id": "string",
    "fsmState": "01_DENTRO_ZONA",
    "data": {
      "comunero": {
        "id": "string",
        "nombre": "Juan Pérez",
        "email": "juan@email.com",
        "telefono": "+34 600 123 456",
        "direccion": "Calle Principal 123",
        "codigoPostal": "28001",
        "ciudad": "Madrid",
        "provincia": "Madrid"
      },
      "token": "jwt_token_string",
      "enZona": "inZone",
      "propuestaId": "PROP-2024-001234",
      "dealId": "DEAL-789",
      "analisisTratos": {
        "tieneTratoCerradoGanado": false,
        "hasInversor": null,
        "tratoGanadoBaterias": false,
        "bateriaInicial": null,
        "tieneAmpliacionBaterias": false,
        "bateriaAmpliacion": null
      },
      "respuestasPreguntas": {
        "tieneInstalacionFV": null,
        "tieneInversorHuawei": "",
        "tipoInversorHuawei": "",
        "tipoInstalacion": "",
        "tipoCuadroElectrico": "",
        "tieneBaterias": null,
        "tipoBaterias": "",
        "capacidadCanadian": "",
        "capacidadHuawei": "",
        "instalacionCerca10m": null,
        "metrosExtra": "",
        "requiereContactoManual": false
      }
    }
  }
}

RESPUESTA ESPERADA del backend para fsmState "04_DATOS_RECOGIDOS":
{
  "success": true,
  "data": {
    "mpk_log_id": "string",
    "contact_id": "string", 
    "deal_id": "string",
    "fsmState": "04_DATOS_RECOGIDOS",
    "data": {
      "propuestaId": "PROP-2024-001234",
      "token": "jwt_token_string",
      "enZona": "inZone",
      "propuesta": {
        "precio": 4699,
        "nombre": "Pack Batería EcoFlow 5 kWh",
        "grupo": "Pack Batería Monofásico EcoFlow 5 kWh con Inversor de 12 kW",
        "items": [
          { "name": "Pack Baterías EcoFlow 5 kWh" },
          { "name": "1x EcoFlow PowerOcean LFP Battery 5kWh" },
          { "name": "1x Inversor Híbrido EcoFlow PowerOcean DC Fit 12kW" },
          { "name": "Kit de instalación profesional" }
        ]
      },
      "comunero": {
        "id": "string",
        "nombre": "Juan Pérez",
        "email": "juan@email.com",
        "telefono": "+34 600 123 456",
        "direccion": "Calle Principal 123",
        "codigoPostal": "28001",
        "ciudad": "Madrid",
        "provincia": "Madrid"
      }
    }
  }
}

RESPUESTA ESPERADA del backend para fsmState "12_CONTRATA":
{
  "success": true,
  "data": {
    "mpk_log_id": "string",
    "contact_id": "string", 
    "deal_id": "string",
    "fsmState": "12_CONTRATA",
    "data": {
      "propuestaId": "string",
      "propuesta": {
        "id": "string",
        "estado": "Contrato Generado - Esperando Firma",
        "producto": {
          "nombre": "Batería EcoFlow Pro",
          "modelo": "DELTA Pro 3600Wh",
          "capacidad": "3.6kWh",
          "precio": 2499,
          "moneda": "EUR"
        },
        "fechaGeneracion": "2024-01-15T10:30:00Z",
        "numeroContrato": "CT-2024-001234"
      },
      "comunero": {
        "nombre": "Juan Pérez",
        "email": "juan@email.com",
        "telefono": "+34 600 123 456"
      }
    }
  }
}

/*
GUÍA PARA AGREGAR SOPORTE A NUEVOS FSM STATES:

1. **Agregar mapeo de ruta en obtenerRutaPorFsmState():**
   ```typescript
   const rutasPorEstado: Record<string, string> = {
     '01_IN_ZONE_LEAD': '/preguntas-adicionales',
     '02_IN_ZONE_WITH_COST': '/preguntas-con-costo', // ← Nueva ruta
     '03_OUT_ZONE': '/fuera-zona',
     // ... agregar más según necesidad
   };
   ```

2. **Agregar procesamiento en cargarComuneroPorId():**
   ```typescript
   if (fsmState === '01_IN_ZONE_LEAD') {
     // Lógica existente
   } else if (fsmState === '02_IN_ZONE_WITH_COST') {
     // ← Agregar nueva lógica aquí
     const procesado = procesarRespuestaConCosto(respuesta); // Nueva función
     datosParaStore = procesado.datosParaStore;
     // Cargar en Zustand usando useFormStore
   } else if (fsmState === '03_OUT_ZONE') {
     // ← Agregar lógica para usuarios fuera de zona
   }
   ```

3. **Crear función procesadora específica si es necesario:**
   ```typescript
   export const procesarRespuestaConCosto = (respuesta: any) => {
     // Procesar estructura específica para este estado
     return { datosParaStore, fsmState, rawResponse };
   };
   ```

4. **Actualizar tipos TypeScript si la estructura cambia**

ESTADO ACTUAL:
✅ Implementado: 01_IN_ZONE_LEAD → Carga automática en Zustand + navegación
⚠️  Pendiente: Todos los demás estados FSM

RESPUESTA ESPERADA del backend para fsmState "06_VISITA_TECNICA":
{
  "success": true,
  "data": {
    "mpk_log_id": "string",
    "contact_id": "string", 
    "deal_id": "string",
    "fsmState": "06_VISITA_TECNICA",
    "comunero": {
      "id": "comunero_123",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com", 
      "telefono": "+34666777888",
      "direccion": "Calle Example 123",
      "codigoPostal": "28001",
      "ciudad": "Madrid",
      "provincia": "Madrid"
    },
    "propuestaData": {
      "propuestaId": "prop_456",
      "amount": 5200,
      "productData": {
        "name": "Pack Batería Trifásico EcoFlow 5 kWh con Inversor de 12 kW",
        "mapped_items": [
          { "name": "Pack Baterías EcoFlow 5 kWh Trifásico" },
          { "name": "1x EcoFlow PowerOcean LFP Battery 5kWh" },
          { "name": "1x Inversor Híbrido Trifásico EcoFlow PowerOcean DC Fit 12kW" },
          { "name": "Modificación cuadro eléctrico" },
          { "name": "Protecciones adicionales trifásicas" }
        ],
        "group_name": "Sistema Trifásico Post-Evaluación"
      },
      "usuario": {
        "nombre": "Juan Pérez",
        "email": "juan@ejemplo.com",
        "direccion": {
          "calle": "Calle Example 123",
          "ciudad": "Madrid", 
          "provincia": "Madrid",
          "codigoPostal": "28001"
        }
      }
    },
    "respuestasPreguntas": {
      "tipoVivienda": "casa",
      "tipoCuadroElectrico": "trifasico_general",
      "tipoInstalacion": "trifasica",
      "tieneInstalacionFV": true,
      "potenciaInstalacion": "6kW"
    },
    "token": "token_jwt_aqui",
    "enZona": "inZone",
    "dealId": "deal_123"
  }
}

FLUJO ACTUAL PARA 01_IN_ZONE_LEAD:
1. Cliente llama: cargarComuneroPorId(clienteId, formStore)
2. Función hace GET /comunero/:id
3. Backend responde con fsmState: "01_IN_ZONE_LEAD"
4. Se procesan los datos con procesarRespuestaComunero()
5. Se cargan automáticamente en Zustand store
6. Se navega a /preguntas-adicionales
7. Usuario ve la vista con todos sus datos precargados

FLUJO PARA 06_VISITA_TECNICA:
1. Cliente llama: cargarComuneroPorId(clienteId, formStore) desde URL /comunero/:propuestaId
2. Función hace GET /comunero/:id
3. Backend responde con fsmState: "06_VISITA_TECNICA" + propuesta final post-evaluación
4. Se procesan los datos con procesarRespuestaVisitaTecnica() (similar a 04_DATOS_RECOGIDOS)
5. Se cargan automáticamente en Zustand store
6. Se navega a /propuesta con precios finales
7. Usuario ve propuesta normal PERO con botón "SOLICITAR VISITA TÉCNICA" deshabilitado
8. Puede proceder a compra normal con botones "CONTRATAR"
*/

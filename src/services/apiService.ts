// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://calculadora-baterias-api-20084454554.development.catalystserverless.eu/server/api';

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
  
  console.log('🌐 Haciendo request a:', cleanEndpoint);
  
  try {
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log('📡 Request URL:', url);
    
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
  async enviarCodigoPorPropuestaId(propuestaId: string): Promise<ApiResponse<{ codigoEnviado: boolean }>> {
    return makeRequest('baterias/comunero/enviar-codigo-por-propuesta', {
      method: 'POST',
      body: JSON.stringify({ 
        propuestaId,
        fsmState: DEFAULT_FSM_STATE
      }),
    });
  },

  // Validar código de verificación
  async validarCodigo(codigo: string, email?: string): Promise<ApiResponse<{ 
    propuestaId?: string;
    token: string; 
    comunero: any; 
    enZona: "inZone" | "inZoneWithCost" | "outZone"; 
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
    return makeRequest('baterias/comunero/edit-existing-info-comunero', {
      method: 'POST',
      body: JSON.stringify({
        ...datosEdicion,
        fsmState: datosEdicion.fsmState || DEFAULT_FSM_STATE
      }),
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
  }): Promise<ApiResponse<{ id: string; solicitud: any }>> {
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
      console.log('📤 Enviando foto para análisis de IA:', {
        endpoint: cleanEndpoint,
        propuestaId: fotoData.propuestaId,
        archivo: fotoData.fotoDisyuntor.name,
        tamano: fotoData.fotoDisyuntor.size
      });
      
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
      console.log(`🧭 Navegando automáticamente a: ${resultado.rutaNavegacion}`);
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

  console.log('📋 Datos procesados para el store:', datosParaStore);
  
  return {
    datosParaStore,
    fsmState,
    rawResponse: data
  };
};

// Helper function para determinar la ruta/vista basada en el fsmState
export const obtenerRutaPorFsmState = (fsmState: string): string => {
  const rutasPorEstado: Record<string, string> = {
    'initial': '/home',
    '01_IN_ZONE_LEAD': '/preguntas-adicionales',
    '02_IN_ZONE_WITH_COST': '/preguntas-adicionales', // Podría ser una vista diferente
    '03_OUT_ZONE': '/fuera-zona', // Vista para usuarios fuera de zona
    '04_MONO_DESCONOCE_A': '/preguntas-adicionales',
    '05_MONO_DESCONOCE_M': '/preguntas-adicionales', 
    '06_TRI_DESCONOCE_A': '/preguntas-adicionales',
    '07_TRI_DESCONOCE_M': '/preguntas-adicionales',
    // Agregar más estados según se definan
  };

  const ruta = rutasPorEstado[fsmState];
  
  if (!ruta) {
    console.warn(`⚠️ No se encontró ruta para fsmState: ${fsmState}, usando /home por defecto`);
    return '/home';
  }

  console.log(`🧭 Navegando a: ${ruta} para fsmState: ${fsmState}`);
  return ruta;
};

// Helper function para cargar un comunero por ID y preparar la navegación
// IMPORTANTE: Esta función debe ser llamada desde un componente React para acceder al store
export const cargarComuneroPorId = async (clienteId: string, useFormStore?: any) => {
  try {
    console.log(`🔍 Cargando comunero con ID: ${clienteId}`);
    
    // Obtener datos del comunero
    const respuesta = await nuevoComuneroService.obtenerPorId(clienteId);
    
    if (!respuesta.success) {
      throw new Error(respuesta.error || 'Error al obtener datos del comunero');
    }

    // Procesar la respuesta según el fsmState
    const { fsmState } = respuesta.data!; // El ! es seguro porque ya verificamos success
    
    let datosParaStore;
    let rutaNavegacion;
    
    // Procesar según el estado FSM (actualmente solo implementado para 01_IN_ZONE_LEAD)
    if (fsmState === '01_IN_ZONE_LEAD') {
      const procesado = procesarRespuestaComunero(respuesta);
      datosParaStore = procesado.datosParaStore;
      rutaNavegacion = obtenerRutaPorFsmState(fsmState);
      
      // Si se proporciona el store, cargar los datos automáticamente
      if (useFormStore) {
        console.log('💾 Cargando datos en Zustand store...');
        
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
        
        // Estado FSM
        setFsmState(datosParaStore.fsmState);
        
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
        
        console.log('✅ Datos cargados en Zustand:', {
          fsmState: datosParaStore.fsmState,
          comunero: datosParaStore.comunero.nombre,
          respuestas: Object.keys(datosParaStore.respuestasPreguntas)
        });
      }
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

FLUJO ACTUAL PARA 01_IN_ZONE_LEAD:
1. Cliente llama: cargarComuneroPorId(clienteId, formStore)
2. Función hace GET /comunero/:id
3. Backend responde con fsmState: "01_IN_ZONE_LEAD"
4. Se procesan los datos con procesarRespuestaComunero()
5. Se cargan automáticamente en Zustand store
6. Se navega a /preguntas-adicionales
7. Usuario ve la vista con todos sus datos precargados
*/

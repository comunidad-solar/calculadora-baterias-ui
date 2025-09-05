// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://calculadora-baterias-api-20084454554.development.catalystserverless.eu/server/api';

// ⚙️ SIMULADOR DE BACKEND PARA DESARROLLO
// Cambia a false cuando el backend esté disponible
const SIMULATE_BACKEND = false;

// Lista de endpoints que ya están listos (no simular)
const REAL_ENDPOINTS = [
  'baterias/comunero/validar-email',
  'baterias/comunero/validar-codigo',
  'baterias/comunero',
  'baterias/comunero/desconoce-unidad/contactar-asesor'
];

// Tipo para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Función para simular delay de red
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Función helper para hacer requests HTTP
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  
  // Limpiar endpoint (remover / inicial si existe)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Verificar si este endpoint debe usar el backend real
  const useRealBackend = REAL_ENDPOINTS.some(realEndpoint => cleanEndpoint === realEndpoint);
  
  console.log('🔍 Debug API:', {
    endpoint,
    cleanEndpoint,
    useRealBackend,
    REAL_ENDPOINTS,
    SIMULATE_BACKEND
  });
  
  // Si estamos simulando el backend Y no es un endpoint real
  if (SIMULATE_BACKEND && !useRealBackend) {
    console.log('📦 Usando simulación para:', cleanEndpoint);
    await simulateDelay();
    
    // Simular respuestas según el endpoint
    if (cleanEndpoint.includes('baterias/comunero/validar-email')) {
      return {
        success: true,
        data: { codigoEnviado: true } as T
      };
    }
    
    if (cleanEndpoint.includes('baterias/comunero/validar-codigo')) {
      // Simular diferentes escenarios según el código
      const body = JSON.parse(options.body as string);
      const codigo = body.codigo;
      
      // Simular comunero fuera de zona (códigos que empiecen con 0)
      if (codigo.startsWith('0')) {
        return {
          success: true,
          data: { 
            token: 'token-fuera-zona',
            comunero: {
              id: '1',
              nombre: 'Juan Pérez García',
              email: body.email || 'juan@example.com',
              telefono: '654321987',
              direccion: 'Calle Mayor 123, 28801 Alcalá de Henares, Madrid',
              codigoPostal: '28801',
              ciudad: 'Alcalá de Henares',
              provincia: 'Madrid'
            },
            enZona: "outZone",
            motivo: 'Tu ubicación está fuera de nuestra área de cobertura actual.',
            analisisTratos: {
              tieneTratoCerradoGanado: false,
              hasInversor: null,
              tratoGanadoBaterias: false,
              bateriaInicial: null,
              tieneAmpliacionBaterias: false,
              bateriaAmpliacion: null
            }
          } 
        } as ApiResponse<T>;
      }
      
      // Simular caso con inversor con datos vacíos (códigos que empiecen con 1)
      if (codigo.startsWith('1')) {
        return {
          success: true,
          data: { 
            token: 'token-inversor-vacio',
            comunero: {
              id: '2',
              nombre: 'Ana López Martín',
              email: body.email || 'ana@example.com',
              telefono: '677888999',
              direccion: 'Plaza España 10, 28013 Madrid',
              codigoPostal: '28013',
              ciudad: 'Madrid',
              provincia: 'Madrid'
            },
            enZona: "inZone",
            dealId: 'propuesta-456',
            analisisTratos: {
              tieneTratoCerradoGanado: true,
              hasInversor: {
                marca: "",
                modelo: "",
                numero: ""
              },
              tratoGanadoBaterias: false,
              bateriaInicial: null,
              tieneAmpliacionBaterias: false,
              bateriaAmpliacion: null
            }
          } 
        } as ApiResponse<T>;
      }
      
      // Simular comunero en zona válida
      return {
        success: true,
        data: { 
          token: 'token-en-zona',
          comunero: {
            id: '1',
            nombre: 'María González López',
            email: body.email || 'maria@example.com',
            telefono: '666789123',
            direccion: 'Avenida de América 45, 28028 Madrid',
            codigoPostal: '28028',
            ciudad: 'Madrid',
            provincia: 'Madrid'
          },
          enZona: "inZone",
          dealId: 'propuesta-123',
          analisisTratos: {
            tieneTratoCerradoGanado: true,
            hasInversor: {
              marca: "Huawei",
              modelo: "Huawei 4KTL-L1", 
              numero: 2
            },
            tratoGanadoBaterias: true,
            bateriaInicial: {
              modeloCapacidad: "6,6 kWh - Batería EP Cube de Canadian Solar"
            },
            tieneAmpliacionBaterias: false,
            bateriaAmpliacion: null
          }
        } 
      } as ApiResponse<T>;
    }
    
    if (cleanEndpoint.includes('baterias/comunero') && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const email = body.email;
      
      // Simular los 3 casos basándose en el email
      if (email.includes('local')) {
        // Caso 1: Email existe en tabla local
        return {
          success: false,
          error: 'Ya existe un registro con este email'
        } as ApiResponse<T>;
      }
      
      if (email.includes('zoho')) {
        // Caso 2: Email existe en Zoho CRM
        return {
          success: false,
          error: 'Ya existe un contacto con este email en Zoho CRM'
        } as ApiResponse<T>;
      }
      
      // Caso 3: Email NO existe en ningún lado - Crear comunero
      return {
        success: true,
        data: { 
          id: 'new-comunero-123', 
          comunero: { 
            id: '1', 
            email: email,
            nombre: 'Nuevo Comunero',
            codigoEnviado: true 
          } 
        } as T
      };
    }
  }

  console.log('🌐 Usando API real para:', cleanEndpoint);
  
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
    const requestBody: any = { email };
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
      body: JSON.stringify({ email }),
    });
  },

  // Validar código de verificación
  async validarCodigo(codigo: string, email?: string): Promise<ApiResponse<{ 
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
      body: JSON.stringify({ codigo, email }),
    });
  },
};

// Servicios para nuevos comuneros
export const nuevoComuneroService = {
  // Crear nuevo comunero
  async crear(comuneroData: any, bypass?: boolean): Promise<ApiResponse<{ id: string; comunero: any }>> {
    const requestBody = { ...comuneroData };
    if (bypass !== undefined) {
      requestBody.bypass = bypass;
    }
    
    return makeRequest('baterias/comunero', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },
  
  // Obtener datos de comunero por ID único
  async obtenerPorId(clienteId: string): Promise<ApiResponse<{ comunero: any }>> {
    return makeRequest(`baterias/comunero/${clienteId}`, {
      method: 'GET',
    });
  },
};

// Servicios para baterías
export const bateriaService = {
  // Crear solicitud de contacto manual para usuarios que desconocen su unidad
  async contactarAsesorDesconoceUnidad(datosCompletos: {
    // Datos del usuario
    usuarioId: string;
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
    dealId?: string;
    enZona?: string;
  }): Promise<ApiResponse<{ id: string; solicitud: any }>> {
    return makeRequest('baterias/comunero/desconoce-unidad/contactar-asesor', {
      method: 'POST',
      body: JSON.stringify(datosCompletos),
    });
  },

  // Crear solicitud de propuesta automatizada (caso normal)
  async crearSolicitud(datosCompletos: {
    // Datos del usuario
    usuarioId: string;
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
    dealId?: string;
    enZona?: string;
  }): Promise<ApiResponse<{ id: string; solicitud: any }>> {
    // TODO: Necesito el endpoint correcto para propuesta automatizada
    return makeRequest('baterias/comunero/propuesta', {
      method: 'POST',
      body: JSON.stringify(datosCompletos),
    });
  },
};

export default {
  comuneroService,
  nuevoComuneroService,
  bateriaService,
};

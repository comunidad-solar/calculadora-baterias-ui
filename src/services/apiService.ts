// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://calculadora-baterias-api-20084454554.development.catalystserverless.eu/server/api';

// ⚙️ SIMULADOR DE BACKEND PARA DESARROLLO
// Cambia a false cuando el backend esté disponible
const SIMULATE_BACKEND = false;

// Lista de endpoints que ya están listos (no simular)
const REAL_ENDPOINTS = [
  'baterias/comunero/validar-email',
  'baterias/comunero/validar-codigo'
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
            enZona: false,
            motivo: 'Tu ubicación está fuera de nuestra área de cobertura actual.'
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
          enZona: true,
          propuestaId: 'propuesta-123'
        } 
      } as ApiResponse<T>;
    }
    
    if (endpoint.includes('baterias/comunero') && options.method === 'POST') {
      return {
        success: true,
        data: { id: 'new-comunero-123', comunero: { id: '1', nombre: 'Nuevo Comunero' } } as T
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
  // Validar email de comunero y enviar código
  async validarEmail(email: string): Promise<ApiResponse<{ codigoEnviado: boolean }>> {
    return makeRequest('baterias/comunero/validar-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Validar código de verificación
  async validarCodigo(codigo: string, email?: string): Promise<ApiResponse<{ token: string; comunero: any }>> {
    return makeRequest('baterias/comunero/validar-codigo', {
      method: 'POST',
      body: JSON.stringify({ codigo, email }),
    });
  },
};

// Servicios para nuevos comuneros
export const nuevoComuneroService = {
  // Crear nuevo comunero
  async crear(comuneroData: any): Promise<ApiResponse<{ id: string; comunero: any }>> {
    return makeRequest('baterias/comunero', {
      method: 'POST',
      body: JSON.stringify(comuneroData),
    });
  },
};

export default {
  comuneroService,
  nuevoComuneroService,
};

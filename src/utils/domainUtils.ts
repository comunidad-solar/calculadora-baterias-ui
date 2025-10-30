/**
 * Utilidades para detectar el tipo de dominio y configuración de la aplicación
 */

/**
 * Verifica si la aplicación está ejecutándose en el dominio de asesores
 * @returns {boolean} true si el dominio contiene "asesores.dbig"
 */
export const isAsesoresDomain = (): boolean => {
  return window.location.hostname.includes('asesores.dbig');
};

/**
 * Obtiene la variable global asesores
 * @returns {boolean} true si está en modo asesores
 */
export const getAsesoresMode = (): boolean => {
  return (window as any).asesores || false;
};

/**
 * Obtiene información completa del dominio
 * @returns {object} Información del dominio actual
 */
export const getDomainInfo = () => {
  const hostname = window.location.hostname;
  const isAsesores = hostname.includes('asesores.dbig');
  
  return {
    hostname,
    isAsesores,
    isDevelopment: hostname === 'localhost' || hostname === '127.0.0.1',
    isProduction: !hostname.includes('localhost') && !hostname.includes('127.0.0.1')
  };
};

/**
 * Log de información del dominio para debugging
 */
export const logDomainInfo = () => {
  const info = getDomainInfo();
  // console.log('🌐 Información del dominio:', info);
  return info;
};

/**
 * Obtiene el dealId de los parámetros de la URL
 * IMPORTANTE: Solo debe usarse en contexto de asesores
 * @returns {string | null} El dealId si existe
 */
export const getDealIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('dealId');
};

/**
 * Obtiene el dealId SOLO si estamos en modo asesores
 * Esta es la función recomendada para usar en la aplicación
 * @returns {string | null} El dealId si existe Y estamos en modo asesores, null en caso contrario
 */
export const getDealIdIfAsesores = (): string | null => {
  if (!isAsesoresDomain()) {
    console.warn('⚠️ DealId solicitado fuera del dominio de asesores. Ignorando.');
    return null;
  }
  return getDealIdFromUrl();
};

/**
 * Valida si tenemos un contexto válido de asesores con deal
 * GARANTIZA que el dealId solo se procese en modo asesores
 * @returns {object} Información de validación
 */
export const validateAsesoresDealContext = () => {
  const isAsesores = isAsesoresDomain();
  const dealId = getDealIdIfAsesores(); // Solo obtiene dealId si es asesores
  
  // Log de validación para debugging
  if (!isAsesores && getDealIdFromUrl()) {
    console.warn('⚠️ DealId detectado en URL pero NO estamos en dominio asesores. DealId ignorado por seguridad.');
  }
  
  return {
    isAsesores,
    dealId,
    hasValidContext: isAsesores && !!dealId,
    shouldProcessDeal: isAsesores && !!dealId
  };
};
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
  console.log('🌐 Información del dominio:', info);
  return info;
};
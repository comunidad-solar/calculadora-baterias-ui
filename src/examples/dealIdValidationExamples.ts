/**
 * Ejemplo de validación correcta de dealId
 * IMPORTANTE: El dealId solo debe procesarse si estamos en modo asesores
 */

import { getDealIdIfAsesores, isAsesoresDomain, validateAsesoresDealContext } from '../utils/domainUtils';

// ✅ CORRECTO: Usar getDealIdIfAsesores()
export const ejemploCorrectoValidacion = () => {
  getDealIdIfAsesores(); 
};

// ✅ CORRECTO: Usar validateAsesoresDealContext()
export const ejemploValidacionCompleta = () => {
  const context = validateAsesoresDealContext();
  
  if (context.shouldProcessDeal) {
    console.log('✅ Procesando deal en modo asesores:', context.dealId);
    // Procesar dealId...
  } else if (context.isAsesores && !context.dealId) {
    console.log('ℹ️ Modo asesores pero sin dealId');
  } else {
    console.log('ℹ️ Modo normal (no asesores)');
  }
};

// ❌ INCORRECTO: No usar getDealIdFromUrl() directamente
// export const ejemploIncorrecto = () => {
//   const dealId = getDealIdFromUrl(); // ❌ No valida si estamos en asesores
//   // Esto podría procesar dealId incluso fuera del dominio asesores
// };

// ✅ CORRECTO: Validación manual completa
export const ejemploValidacionManual = () => {
  if (!isAsesoresDomain()) {
    return;
  }
  
  const dealId = getDealIdIfAsesores();
  if (dealId) {
    console.log('✅ Procesando dealId en modo asesores:');
    // Procesar dealId...
  }
};

export default {
  ejemploCorrectoValidacion,
  ejemploValidacionCompleta,
  ejemploValidacionManual
};
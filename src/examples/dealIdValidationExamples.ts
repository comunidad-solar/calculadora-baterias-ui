/**
 * Ejemplo de validación correcta de dealId
 * IMPORTANTE: El dealId solo debe procesarse si estamos en modo asesores
 */

import { getDealIdIfAsesores, isAsesoresDomain, validateAsesoresDealContext } from '../utils/domainUtils';

// ✅ CORRECTO: Usar getDealIdIfAsesores()
export const ejemploCorrectoValidacion = () => {
  const dealId = getDealIdIfAsesores(); // Solo retorna dealId si estamos en asesores
  
  if (dealId) {
    console.log('✅ DealId válido en modo asesores:', dealId);
    // Procesar dealId...
  } else {
    console.log('ℹ️ No hay dealId válido o no estamos en modo asesores');
  }
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
    console.log('ℹ️ No estamos en dominio asesores, ignorando cualquier dealId');
    return;
  }
  
  const dealId = getDealIdIfAsesores();
  if (dealId) {
    console.log('✅ Procesando dealId en modo asesores:', dealId);
    // Procesar dealId...
  }
};

export default {
  ejemploCorrectoValidacion,
  ejemploValidacionCompleta,
  ejemploValidacionManual
};
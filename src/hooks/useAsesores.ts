import { useFormStore } from '../zustand/formStore';
import { isAsesoresDomain, getAsesoresMode, getDealIdIfAsesores } from '../utils/domainUtils';

/**
 * Hook personalizado para acceder al modo asesores
 * NOTA: Ya no maneja la carga automática de deals. Eso se hace en App.tsx
 * @returns {object} Información del modo asesores
 */
export const useAsesores = () => {
  const { form } = useFormStore();
  
  return {
    // Desde el store de Zustand
    isAsesores: form.asesores,
    
    // Información del deal (solo en modo asesores)
    dealId: form.dealId || getDealIdIfAsesores(),
    
    // Desde la variable global (más rápido)
    isAsesoresGlobal: getAsesoresMode(),
    
    // Desde el dominio (más preciso)
    isAsesoresDomain: isAsesoresDomain(),
    
    // Función de utilidad para verificar cualquiera de las opciones
    checkAsesoresMode: () => form.asesores || getAsesoresMode() || isAsesoresDomain(),
    
    // Verificar si tenemos un deal válido en modo asesores
    hasValidDeal: () => {
      const dealId = form.dealId || getDealIdIfAsesores();
      return (form.asesores || getAsesoresMode() || isAsesoresDomain()) && !!dealId;
    }
  };
};

export default useAsesores;
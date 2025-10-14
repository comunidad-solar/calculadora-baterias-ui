import { useFormStore } from '../zustand/formStore';
import { isAsesoresDomain, getAsesoresMode } from '../utils/domainUtils';

/**
 * Hook personalizado para acceder al modo asesores
 * @returns {object} Información del modo asesores
 */
export const useAsesores = () => {
  const { form } = useFormStore();
  
  return {
    // Desde el store de Zustand
    isAsesores: form.asesores,
    
    // Desde la variable global (más rápido)
    isAsesoresGlobal: getAsesoresMode(),
    
    // Desde el dominio (más preciso)
    isAsesoresDomain: isAsesoresDomain(),
    
    // Función de utilidad para verificar cualquiera de las opciones
    checkAsesoresMode: () => form.asesores || getAsesoresMode() || isAsesoresDomain()
  };
};

export default useAsesores;
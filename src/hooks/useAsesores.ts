import { useFormStore } from '../zustand/formStore';
import { isAsesoresDomain, getAsesoresMode, validateAsesoresDealContext, getDealIdIfAsesores } from '../utils/domainUtils';
import { bateriaService } from '../services/apiService';
import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para acceder al modo asesores
 * @returns {object} Información del modo asesores
 */
export const useAsesores = () => {
  const { form } = useFormStore();
  const [dealData, setDealData] = useState<any>(null);
  const [isLoadingDeal, setIsLoadingDeal] = useState(false);
  const [dealError, setDealError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const processedRef = useRef(false);

  // Validar contexto de asesores al cargar (solo una vez)
  useEffect(() => {
    const context = validateAsesoresDealContext();
    
    if (context.shouldProcessDeal && !processingRef.current && !processedRef.current) {
      console.log('🔄 Iniciando procesamiento único del deal:', context.dealId);
      procesarDeal(context.dealId!);
    } else if (context.shouldProcessDeal && processingRef.current) {
      console.log('⏳ Ya hay un procesamiento de deal en curso, ignorando duplicado');
    }
  }, []);

  const procesarDeal = async (dealId: string) => {
    // Evitar múltiples llamadas simultáneas
    if (processingRef.current || processedRef.current) {
      console.log('🚫 Deal ya está siendo procesado o ya fue procesado, ignorando');
      return;
    }

    processingRef.current = true;
    setIsLoadingDeal(true);
    setDealError(null);
    
    try {
      console.log('📡 Realizando llamada única al backend para deal:', dealId);
      const response = await bateriaService.obtenerDealPorId(dealId);
      
      if (response.success && response.data) {
        console.log('📊 Deal cargado exitosamente:', response.data);
        setDealData(response.data);
        
        // Procesar y guardar los datos en el store
        const { setValidacionData, setField, setRespuestasPreguntas } = useFormStore.getState();
        
        // Guardar datos de validación
        if (response.data.data) {
          const validacionData = {
            token: response.data.data.token,
            comunero: response.data.data.comunero,
            enZona: response.data.data.enZona,
            motivo: response.data.data.motivo || '',
            propuestaId: response.data.data.propuestaId,
            analisisTratos: response.data.data.analisisTratos,
            dealId: response.data.data.dealId
          };
          
          console.log('� Guardando datos de validación desde deal:', validacionData);
          setValidacionData(validacionData);
          
          // Guardar respuestas de preguntas adicionales si existen
          if (response.data.data.respuestasPreguntas) {
            console.log('📝 Guardando respuestas de preguntas desde deal:', response.data.data.respuestasPreguntas);
            setRespuestasPreguntas(response.data.data.respuestasPreguntas);
          }
          
          // Marcar que venimos de asesores con deal
          setField('fromAsesoresDeal', true);
        }
        
        processedRef.current = true;
      } else {
        throw new Error(response.error || 'Error al obtener información del deal');
      }
    } catch (error) {
      console.error('❌ Error cargando deal:', error);
      setDealError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      processingRef.current = false;
      setIsLoadingDeal(false);
    }
  };

  const validarDealId = async (dealId: string) => {
    try {
      const deal = await bateriaService.obtenerDealPorId(dealId);
      return deal;
    } catch (error) {
      console.error('Error validando deal:', error);
      return null;
    }
  };

  const resetDealProcessing = () => {
    processingRef.current = false;
    processedRef.current = false;
    setDealData(null);
    setDealError(null);
    setIsLoadingDeal(false);
    console.log('🔄 Estado del deal reseteado');
  };
  
  return {
    // Desde el store de Zustand
    isAsesores: form.asesores,
    
    // Información del deal (solo en modo asesores)
    dealId: form.dealId || getDealIdIfAsesores(),
    dealData,
    isLoadingDeal,
    dealError,
    
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
    },

    // Funciones de utilidad
    procesarDeal,
    validarDealId,
    resetDealProcessing
  };
};

export default useAsesores;
// Definición de tipos para la Máquina de Estados Finitos (FSM)
export type FSMState = 
  | 'initial'
  | 'loading'
  | 'selecting_user_type'
  | 'comunero_flow'
  | 'nuevo_comunero_flow'
  | 'questions_flow'
  | 'form_filling'
  | 'form_validation'
  | 'form_submission'
  | 'calc_to_negociacion'
  | 'success'
  | 'error'
  // Estados específicos para flujo de baterías
  | '01_IN_ZONE_LEAD'
  | '02_OUT_ZONE_LEAD'
  | '03_DESCONOCE_TENSION'
  | '04_DATOS_RECOGIDOS'
  | '04_MONO_MAS15_M'
  | '05_MONO_DESCONOCE_M'
  | '06_TRI_MAS15_M'
  | '07_TRI_DESCONOCE_M';

// Función helper para validar estados
export const isValidFSMState = (state: string): state is FSMState => {
  const validStates: FSMState[] = [
    'initial',
    'loading',
    'selecting_user_type',
    'comunero_flow',
    'nuevo_comunero_flow',
    'questions_flow',
    'form_filling',
    'form_validation',
    'form_submission',
    'calc_to_negociacion',
    'success',
    'error',
    // Estados específicos para flujo de baterías
    '01_IN_ZONE_LEAD',
    '02_OUT_ZONE_LEAD',
    '03_DESCONOCE_TENSION',
    '04_DATOS_RECOGIDOS',
    '04_MONO_MAS15_M',
    '05_MONO_DESCONOCE_M',
    '06_TRI_MAS15_M',
    '07_TRI_DESCONOCE_M'
  ];
  return validStates.includes(state as FSMState);
};

// Constantes para los estados (evita typos)
export const FSM_STATES = {
  INITIAL: 'initial' as const,
  LOADING: 'loading' as const,
  SELECTING_USER_TYPE: 'selecting_user_type' as const,
  COMUNERO_FLOW: 'comunero_flow' as const,
  NUEVO_COMUNERO_FLOW: 'nuevo_comunero_flow' as const,
  QUESTIONS_FLOW: 'questions_flow' as const,
  FORM_FILLING: 'form_filling' as const,
  FORM_VALIDATION: 'form_validation' as const,
  FORM_SUBMISSION: 'form_submission' as const,
  CALC_TO_NEGOCIACION: 'calc_to_negociacion' as const,
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  // Estados específicos para flujo de baterías
  IN_ZONE_LEAD: '01_IN_ZONE_LEAD' as const,
  OUT_ZONE_LEAD: '02_OUT_ZONE_LEAD' as const,
  DESCONOCE_TENSION: '03_DESCONOCE_TENSION' as const,
  MONO_MAS15_M: '04_MONO_MAS15_M' as const,
  MONO_DESCONOCE_M: '05_MONO_DESCONOCE_M' as const,
  TRI_MAS15_M: '06_TRI_MAS15_M' as const,
  TRI_DESCONOCE_M: '07_TRI_DESCONOCE_M' as const,
} as const;

// Estado por defecto para solicitudes al backend
export const DEFAULT_FSM_STATE: FSMState = 'questions_flow';

// Helper para obtener el estado FSM apropiado basado en condiciones
export const getFSMStateForRequest = (options?: {
  enZona?: string;
  tipoInstalacion?: string;
  metrosExtra?: string;
  instalacionCerca10m?: boolean;
  tipoCuadroElectrico?: string;
}): FSMState => {
  if (!options) return DEFAULT_FSM_STATE;
  
  const { enZona, tipoInstalacion, metrosExtra, instalacionCerca10m, tipoCuadroElectrico } = options;
  
  // Lead en zona
  if (enZona === 'inZone' || enZona === 'inZoneWithCost') {
    return FSM_STATES.IN_ZONE_LEAD;
  }
  
  // Lead fuera de zona
  if (enZona === 'outZone') {
    return FSM_STATES.OUT_ZONE_LEAD;
  }
  
  // Desconoce tensión
  if (tipoInstalacion === 'desconozco' || tipoCuadroElectrico === 'ninguno') {
    return FSM_STATES.DESCONOCE_TENSION;
  }
  
  // Estados específicos por tipo y metros
  if (tipoInstalacion === 'monofasica') {
    if (instalacionCerca10m === false) {
      if (metrosExtra === 'más de 15m') {
        return FSM_STATES.MONO_MAS15_M;
      }
      if (metrosExtra === 'lo desconoce' || metrosExtra === 'prefiero hablar con un asesor') {
        return FSM_STATES.MONO_DESCONOCE_M;
      }
    }
  }
  
  if (tipoInstalacion === 'trifasica') {
    if (instalacionCerca10m === false) {
      if (metrosExtra === 'más de 15m') {
        return FSM_STATES.TRI_MAS15_M;
      }
      if (metrosExtra === 'lo desconoce' || metrosExtra === 'prefiero hablar con un asesor') {
        return FSM_STATES.TRI_DESCONOCE_M;
      }
    }
  }
  
  return DEFAULT_FSM_STATE;
};

// Transiciones permitidas (opcional - para validación adicional)
export const FSM_TRANSITIONS: Record<FSMState, FSMState[]> = {
  initial: ['loading', 'selecting_user_type'],
  loading: ['selecting_user_type', 'error'],
  selecting_user_type: ['comunero_flow', 'nuevo_comunero_flow'],
  comunero_flow: ['questions_flow', 'form_filling', 'error'],
  nuevo_comunero_flow: ['questions_flow', 'form_filling', 'error'],
  questions_flow: ['form_filling', 'calc_to_negociacion', 'error', '01_IN_ZONE_LEAD', '02_OUT_ZONE_LEAD', '03_DESCONOCE_TENSION'],
  form_filling: ['form_validation', 'error'],
  form_validation: ['form_submission', 'form_filling', 'error'],
  form_submission: ['success', 'error'],
  calc_to_negociacion: ['success', 'error'],
  success: ['initial'],
  error: ['initial', 'selecting_user_type', 'form_filling'],
  // Estados específicos para flujo de baterías
  '01_IN_ZONE_LEAD': ['success', 'error'],
  '02_OUT_ZONE_LEAD': ['success', 'error'],
  '03_DESCONOCE_TENSION': ['04_MONO_MAS15_M', '05_MONO_DESCONOCE_M', '06_TRI_MAS15_M', '07_TRI_DESCONOCE_M', 'success', 'error'],
  '04_DATOS_RECOGIDOS': ['success', 'error'],
  '04_MONO_MAS15_M': ['success', 'error'],
  '05_MONO_DESCONOCE_M': ['success', 'error'],
  '06_TRI_MAS15_M': ['success', 'error'],
  '07_TRI_DESCONOCE_M': ['success', 'error'],
};

// Tipos específicos para estados de baterías
export type BatteryFSMState = 
  | '01_IN_ZONE_LEAD'
  | '02_OUT_ZONE_LEAD' 
  | '03_DESCONOCE_TENSION'
  | '04_DATOS_RECOGIDOS'
  | '04_MONO_MAS15_M'
  | '05_MONO_DESCONOCE_M'
  | '06_TRI_MAS15_M'
  | '07_TRI_DESCONOCE_M';

// Helper para verificar si es un estado de baterías
export const isBatteryFSMState = (state: FSMState): state is BatteryFSMState => {
  const batteryStates: BatteryFSMState[] = [
    '01_IN_ZONE_LEAD',
    '02_OUT_ZONE_LEAD',
    '03_DESCONOCE_TENSION',
    '04_MONO_MAS15_M',
    '05_MONO_DESCONOCE_M',
    '06_TRI_MAS15_M',
    '07_TRI_DESCONOCE_M'
  ];
  return batteryStates.includes(state as BatteryFSMState);
};

// Mapeo de estados a descripciones legibles
export const FSM_STATE_DESCRIPTIONS: Record<FSMState, string> = {
  initial: 'Estado inicial',
  loading: 'Cargando',
  selecting_user_type: 'Seleccionando tipo de usuario',
  comunero_flow: 'Flujo de comunero existente',
  nuevo_comunero_flow: 'Flujo de nuevo comunero',
  questions_flow: 'Flujo de preguntas',
  form_filling: 'Llenando formulario',
  form_validation: 'Validando formulario',
  form_submission: 'Enviando formulario',
  calc_to_negociacion: 'Calculadora a negociación',
  success: 'Éxito',
  error: 'Error',
  // Estados específicos para flujo de baterías
  '01_IN_ZONE_LEAD': 'Lead en zona - Instalación estándar',
  '02_OUT_ZONE_LEAD': 'Lead fuera de zona - Requiere evaluación',
  '03_DESCONOCE_TENSION': 'Desconoce tensión - Requiere identificación',
  '04_DATOS_RECOGIDOS': 'Datos recogidos - Propuesta lista',
  '04_MONO_MAS15_M': 'Monofásico más de 15m - Requiere asesor',
  '05_MONO_DESCONOCE_M': 'Monofásico metros desconocidos - Requiere asesor',
  '06_TRI_MAS15_M': 'Trifásico más de 15m - Requiere asesor',
  '07_TRI_DESCONOCE_M': 'Trifásico metros desconocidos - Requiere asesor',
};

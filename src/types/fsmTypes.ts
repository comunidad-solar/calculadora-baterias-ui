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
  | 'error';

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
    'error'
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
} as const;

// Transiciones permitidas (opcional - para validación adicional)
export const FSM_TRANSITIONS: Record<FSMState, FSMState[]> = {
  initial: ['loading', 'selecting_user_type'],
  loading: ['selecting_user_type', 'error'],
  selecting_user_type: ['comunero_flow', 'nuevo_comunero_flow'],
  comunero_flow: ['questions_flow', 'form_filling', 'error'],
  nuevo_comunero_flow: ['questions_flow', 'form_filling', 'error'],
  questions_flow: ['form_filling', 'calc_to_negociacion', 'error'],
  form_filling: ['form_validation', 'error'],
  form_validation: ['form_submission', 'form_filling', 'error'],
  form_submission: ['success', 'error'],
  calc_to_negociacion: ['success', 'error'],
  success: ['initial'],
  error: ['initial', 'selecting_user_type', 'form_filling'],
};

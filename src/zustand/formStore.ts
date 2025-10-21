import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FSMState } from '../types/fsmTypes';
import { FSM_STATES } from '../types/fsmTypes';

interface FormState {
  // Datos básicos del formulario
  nombre: string;
  apellidos: string;
  mail: string;
  telefono: string;
  direccion: string;
  direccionComplementaria: string;
  codigoPostal: string; // Agregado para código postal extraído de Google Places
  ciudad: string; // Agregado para ciudad extraída de Google Places
  provincia: string; // Agregado para provincia extraída de Google Places
  pais: string; // Agregado para país extraído de Google Places
  proteccionDatos: boolean;
  utm: string;
  campaignSource: string;
  bypass: boolean;
  bypassActive: boolean; // Nuevo campo para mantener el estado de bypass durante toda la sesión
  asesores: boolean;
  fromAsesoresDeal: boolean;
  fsmState: FSMState;
  
  // Datos de validación del backend
  token?: string;
  comunero?: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    codigoPostal?: string;
    ciudad?: string;
    provincia?: string;
  };
  enZona?: "inZone" | "inZoneWithCost" | "outZone" | "NoCPAvailable";
  motivo?: string;
  dealId?: string;
  propuestaId?: string;
  mpkLogId?: string; // ID de log de MPK del backend
  
  // Análisis de tratos (datos del backend)
  analisisTratos?: {
    tieneTratoCerradoGanado: boolean;
    hasInversor: {
      marca: string;
      modelo: string;
      numero: number | string;
    } | null;
    tratoGanadoBaterias: boolean;
    bateriaInicial: {
      modeloCapacidad: string;
    } | null;
    tieneAmpliacionBaterias: boolean;
    bateriaAmpliacion: any | null;
  };
  
  // Respuestas a las preguntas adicionales
  respuestasPreguntas: {
    tieneInstalacionFV?: boolean | null;
    tieneInversorHuawei?: string;
    tipoInversorHuawei?: string;
    fotoInversor?: File | null;
    tipoInstalacion?: string;
    tipoCuadroElectrico?: string;
    fotoDisyuntor?: File | null; // Foto del disyuntor para análisis por IA
    analisisIA?: {
      tipoDetectado: 'monofasico' | 'trifasico' | 'desconocido';
      confianza?: number;
      mensaje?: string;
      procesando?: boolean;
    } | null;
    tieneBaterias?: boolean | null;
    tipoBaterias?: string;
    capacidadCanadian?: string;
    capacidadHuawei?: string;
    instalacionCerca10m?: boolean | null;
    requiereContactoManual?: boolean;
    [key: string]: any; // Para preguntas adicionales futuras
  };
}

interface FormStore {
  form: FormState;
  setField: (field: keyof FormState, value: any) => void;
  setFsmState: (state: FSMState) => void;
  setValidacionData: (data: {
    token: string;
    comunero: any;
    enZona: "inZone" | "inZoneWithCost" | "outZone" | "NoCPAvailable";
    motivo?: string;
    dealId?: string;
    propuestaId?: string;
    mpkLogId?: string;
    analisisTratos?: any;
  }) => void;
  setRespuestaPregunta: (pregunta: string, respuesta: any) => void;
  setRespuestasPreguntas: (respuestas: any) => void;
  submitForm: () => void;
  resetForm: () => void;
}

const initialState: FormState = {
  nombre: '',
  apellidos: '',
  mail: '',
  telefono: '',
  direccion: '',
  direccionComplementaria: '',
  codigoPostal: '', // Código postal extraído de Google Places
  ciudad: '', // Ciudad extraída de Google Places
  provincia: '', // Provincia extraída de Google Places
  pais: '', // País extraído de Google Places
  proteccionDatos: false,
  utm: '', // Aquí puedes inicializar con el valor UTM si lo tienes
  campaignSource: '',
  bypass: false,
  bypassActive: false, // Inicialmente false, se activa cuando se detecta bypass=true en URL
  asesores: false,
  fromAsesoresDeal: false,
  fsmState: FSM_STATES.INITIAL, // Estado inicial de la máquina de estados
  
  // Inicializar respuestas de preguntas
  respuestasPreguntas: {
    tieneInstalacionFV: null,
    tieneInversorHuawei: '',
    tipoInversorHuawei: '',
    fotoInversor: null,
    tipoInstalacion: '',
    tipoCuadroElectrico: '',
    fotoDisyuntor: null,
    analisisIA: null,
    tieneBaterias: null,
    tipoBaterias: '',
    capacidadCanadian: '',
    capacidadHuawei: '',
    instalacionCerca10m: null,
    requiereContactoManual: false,
  },
};

export const useFormStore = create<FormStore>()(
  devtools(
    (set, get) => ({
      form: initialState,
      setField: (field, value) =>
        set(
          state => ({
            form: { ...state.form, [field]: value },
          }),
          false,
          `setField_${field}`
        ),
      setFsmState: (state) =>
        set(
          currentState => ({
            form: { ...currentState.form, fsmState: state },
          }),
          false,
          `setFsmState_${state}`
        ),
      setValidacionData: (data) =>
        set(
          state => ({
            form: { 
              ...state.form, 
              token: data.token,
              comunero: data.comunero,
              enZona: data.enZona,
              motivo: data.motivo,
              dealId: data.dealId,
              propuestaId: data.propuestaId,
              mpkLogId: data.mpkLogId,
              analisisTratos: data.analisisTratos,
            },
          }),
          false,
          'setValidacionData'
        ),
      setRespuestaPregunta: (pregunta, respuesta) =>
        set(
          state => ({
            form: {
              ...state.form,
              respuestasPreguntas: {
                ...state.form.respuestasPreguntas,
                [pregunta]: respuesta,
              },
            },
          }),
          false,
          `setRespuestaPregunta_${pregunta}`
        ),
      setRespuestasPreguntas: (respuestas) =>
        set(
          state => ({
            form: {
              ...state.form,
              respuestasPreguntas: {
                ...state.form.respuestasPreguntas,
                ...respuestas,
              },
            },
          }),
          false,
          'setRespuestasPreguntas'
        ),
      submitForm: () => {
        // Aquí puedes manejar el envío, por ejemplo guardar en localStorage o enviar a una API
        set({}, false, 'submitForm');
        console.log('Datos:', get().form);
      },
      resetForm: () =>
        set(
          { form: initialState },
          false,
          'resetForm'
        ),
    }),
    {
      name: 'form-store', // nombre que aparecerá en Redux DevTools
    }
  )
);

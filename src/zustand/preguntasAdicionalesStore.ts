import { create } from 'zustand';

interface PreguntasAdicionalesState {
  // Pregunta principal
  tieneInstalacionFV: boolean | null;
  
  // Flujo CON instalación FV
  tieneInversorHuawei: string;
  tipoInversorHuawei: string;
  fotoInversor: File | null;
  
  // Flujo SIN instalación FV
  tipoInstalacion: string;
  
  // Flujo "Lo desconozco"
  tipoCuadroElectrico: string;
  
  // Flujo con tipo conocido (monofásica/trifásica)
  tieneBaterias: boolean | null;
  tipoBaterias: string;
  capacidadCanadian: string;
  capacidadHuawei: string;
  instalacionCerca10m: boolean | null;
}

interface PreguntasAdicionalesStore {
  preguntas: PreguntasAdicionalesState;
  setField: (field: keyof PreguntasAdicionalesState, value: any) => void;
  resetAll: () => void;
  resetDependentFields: (field: keyof PreguntasAdicionalesState, value?: any) => void;
}

const initialState: PreguntasAdicionalesState = {
  tieneInstalacionFV: null,
  tieneInversorHuawei: '',
  tipoInversorHuawei: '',
  fotoInversor: null,
  tipoInstalacion: '',
  tipoCuadroElectrico: '',
  tieneBaterias: null,
  tipoBaterias: '',
  capacidadCanadian: '',
  capacidadHuawei: '',
  instalacionCerca10m: null,
};

export const usePreguntasAdicionalesStore = create<PreguntasAdicionalesStore>((set, get) => ({
  preguntas: initialState,
  
  setField: (field, value) =>
    set(state => ({
      preguntas: { ...state.preguntas, [field]: value },
    })),
  
  resetAll: () =>
    set({ preguntas: initialState }),
  
  resetDependentFields: (field, value?) => {
    const state = get().preguntas;
    
    switch (field) {
      case 'tieneInstalacionFV':
        set({
          preguntas: {
            ...state,
            tieneInversorHuawei: '',
            tipoInversorHuawei: '',
            fotoInversor: null,
            tipoInstalacion: '',
            tipoCuadroElectrico: '',
            tieneBaterias: null,
            tipoBaterias: '',
            capacidadCanadian: '',
            capacidadHuawei: '',
            instalacionCerca10m: null,
          }
        });
        break;
        
      case 'tieneInversorHuawei':
        set({
          preguntas: {
            ...state,
            tipoInversorHuawei: '',
            fotoInversor: null,
          }
        });
        break;
        
      case 'tipoInversorHuawei':
        if (value !== 'desconozco') {
          set({
            preguntas: {
              ...state,
              fotoInversor: null,
            }
          });
        }
        break;
        
      case 'tipoInstalacion':
        if (value !== 'desconozco') {
          set({
            preguntas: {
              ...state,
              tipoCuadroElectrico: '',
            }
          });
        }
        set({
          preguntas: {
            ...state,
            tieneBaterias: null,
            tipoBaterias: '',
            capacidadCanadian: '',
            capacidadHuawei: '',
            instalacionCerca10m: null,
          }
        });
        break;
        
      case 'tieneBaterias':
        set({
          preguntas: {
            ...state,
            tipoBaterias: '',
            capacidadCanadian: '',
            capacidadHuawei: '',
            instalacionCerca10m: null,
          }
        });
        break;
        
      case 'tipoBaterias':
        set({
          preguntas: {
            ...state,
            capacidadCanadian: '',
            capacidadHuawei: '',
          }
        });
        break;
    }
  },
}));

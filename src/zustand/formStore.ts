import { create } from 'zustand';

interface FormState {
  nombre: string;
  mail: string;
  telefono: string;
  direccion: string;
  direccionComplementaria: string;
  proteccionDatos: boolean;
  utm: string;
  campaignSource: string;
  bypass: boolean;
}

interface FormStore {
  form: FormState;
  setField: (field: keyof FormState, value: any) => void;
  submitForm: () => void;
}

const initialState: FormState = {
  nombre: '',
  mail: '',
  telefono: '',
  direccion: '',
  direccionComplementaria: '',
  proteccionDatos: false,
  utm: '', // Aquí puedes inicializar con el valor UTM si lo tienes
  campaignSource: '',
  bypass: false,
};

export const useFormStore = create<FormStore>((set, get) => ({
  form: initialState,
  setField: (field, value) =>
    set(state => ({
      form: { ...state.form, [field]: value },
    })),
  submitForm: () => {
    // Aquí puedes manejar el envío, por ejemplo guardar en localStorage o enviar a una API
    
    console.log('Datos:', get().form);
  },
}));

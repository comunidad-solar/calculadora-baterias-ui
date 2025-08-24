import { create } from 'zustand';

interface FormState {
  nombre: string;
  mail: string;
  telefono: string;
  direccion: string;
  proteccionDatos: boolean;
  utm: string;
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
  proteccionDatos: false,
  utm: '', // Aquí puedes inicializar con el valor UTM si lo tienes
};

export const useFormStore = create<FormStore>((set, get) => ({
  form: initialState,
  setField: (field, value) =>
    set(state => ({
      form: { ...state.form, [field]: value },
    })),
  submitForm: () => {
    // Aquí puedes manejar el envío, por ejemplo guardar en localStorage o enviar a una API
    alert('Formulario enviado!');
    console.log('Datos:', get().form);
  },
}));

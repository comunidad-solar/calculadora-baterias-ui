import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  tipoInstalacion?: 'monofasica' | 'trifasica' | 'desconozco';
  tieneBaterias?: boolean;
}

export interface ValidacionResponse {
  token: string;
  comunero: Usuario;
  enZona: "inZone" | "inZoneWithCost" | "outZone" | "NoCPAvailable";
  motivo?: string;
  propuestaId?: string;
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
}

interface UsuarioContextType {
  usuario: Usuario | null;
  validacionData: ValidacionResponse | null;
  setValidacionData: (data: ValidacionResponse) => void;
  updateUsuario: (userData: Partial<Usuario>) => void;
  logout: () => void;
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (context === undefined) {
    throw new Error('useUsuario must be used within a UsuarioProvider');
  }
  return context;
};

interface UsuarioProviderProps {
  children: ReactNode;
}

export const UsuarioProvider = ({ children }: UsuarioProviderProps) => {
  const [validacionData, setValidacionDataState] = useState<ValidacionResponse | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Efecto para cargar datos desde sessionStorage al inicializar
  useEffect(() => {
    try {
      const savedValidacionData = sessionStorage.getItem('validacionData');
      const savedUsuario = sessionStorage.getItem('usuario');
      
      if (savedValidacionData) {
        const parsedValidacionData = JSON.parse(savedValidacionData);
        setValidacionDataState(parsedValidacionData);
      }
      
      if (savedUsuario) {
        const parsedUsuario = JSON.parse(savedUsuario);
        setUsuario(parsedUsuario);
      }
    } catch (error) {
      console.error('Error al cargar datos desde sessionStorage:', error);
      // Si hay error, limpiar sessionStorage
      sessionStorage.removeItem('validacionData');
      sessionStorage.removeItem('usuario');
    }
  }, []);

  const setValidacionData = (data: ValidacionResponse) => {
    setValidacionDataState(data);
    setUsuario(data.comunero);
    
    // Guardar en sessionStorage para persistir entre navegaciones
    try {
      sessionStorage.setItem('validacionData', JSON.stringify(data));
      sessionStorage.setItem('usuario', JSON.stringify(data.comunero));
    } catch (error) {
      console.error('Error al guardar en sessionStorage:', error);
    }
  };

  const updateUsuario = (userData: Partial<Usuario>) => {
    if (usuario) {
      const updatedUsuario = { ...usuario, ...userData };
      setUsuario(updatedUsuario);
      
      // También actualizar en validacionData si existe
      if (validacionData) {
        const updatedValidacion = {
          ...validacionData,
          comunero: updatedUsuario
        };
        setValidacionDataState(updatedValidacion);
        
        // Actualizar sessionStorage
        try {
          sessionStorage.setItem('validacionData', JSON.stringify(updatedValidacion));
          sessionStorage.setItem('usuario', JSON.stringify(updatedUsuario));
        } catch (error) {
          console.error('Error al actualizar sessionStorage:', error);
        }
      }
    }
  };

  const logout = () => {
    setValidacionDataState(null);
    setUsuario(null);
    // Limpiar sessionStorage
    sessionStorage.removeItem('validacionData');
    sessionStorage.removeItem('usuario');
  };

  // Limpiar localStorage existente para evitar conflictos con Zustand
  useEffect(() => {
    // Limpiar datos antiguos de localStorage para evitar conflictos
    localStorage.removeItem('validacionData');
    localStorage.removeItem('usuario');
  }, []);

  const value = {
    usuario,
    validacionData,
    setValidacionData,
    updateUsuario,
    logout,
  };

  return (
    <UsuarioContext.Provider value={value}>
      {children}
    </UsuarioContext.Provider>
  );
};

export default UsuarioContext;

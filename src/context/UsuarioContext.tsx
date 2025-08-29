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
  enZona: "inZone" | "inZoneWithCost" | "outZone";
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

  const setValidacionData = (data: ValidacionResponse) => {
    setValidacionDataState(data);
    setUsuario(data.comunero);
    // Guardar en localStorage para persistencia
    localStorage.setItem('validacionData', JSON.stringify(data));
    localStorage.setItem('usuario', JSON.stringify(data.comunero));
  };

  const updateUsuario = (userData: Partial<Usuario>) => {
    if (usuario) {
      const updatedUsuario = { ...usuario, ...userData };
      setUsuario(updatedUsuario);
      localStorage.setItem('usuario', JSON.stringify(updatedUsuario));
      
      // También actualizar en validacionData si existe
      if (validacionData) {
        const updatedValidacion = {
          ...validacionData,
          comunero: updatedUsuario
        };
        setValidacionDataState(updatedValidacion);
        localStorage.setItem('validacionData', JSON.stringify(updatedValidacion));
      }
    }
  };

  const logout = () => {
    setValidacionDataState(null);
    setUsuario(null);
    localStorage.removeItem('validacionData');
    localStorage.removeItem('usuario');
  };

  // Restaurar datos al cargar (si existen)
  useEffect(() => {
    const savedValidacion = localStorage.getItem('validacionData');
    const savedUsuario = localStorage.getItem('usuario');
    
    if (savedValidacion && savedUsuario) {
      try {
        setValidacionDataState(JSON.parse(savedValidacion));
        setUsuario(JSON.parse(savedUsuario));
      } catch (error) {
        console.error('Error al restaurar datos del usuario:', error);
        logout();
      }
    }
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

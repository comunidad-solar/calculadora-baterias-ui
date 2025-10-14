import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes/routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AsesoresDealLoader from "./components/AsesoresDealLoader";
import { ToastProvider } from "./context/ToastContext";
import { UsuarioProvider } from "./context/UsuarioContext";
import { useFormStore } from "./zustand/formStore";
import { validateAsesoresDealContext, logDomainInfo } from "./utils/domainUtils";
import { useAsesores } from "./hooks/useAsesores";


function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setField } = useFormStore();
  const { isAsesores, hasValidDeal, isLoadingDeal, dealData } = useAsesores();


  useEffect(() => {
    // Log información del dominio
    logDomainInfo();
    
    // Validar contexto completo de asesores
    const context = validateAsesoresDealContext();
    
    // Configurar modo asesores
    setField('asesores', context.isAsesores);
    (window as any).asesores = context.isAsesores;
    
    if (context.isAsesores) {
      console.log('� Modo asesores activado');
    } else {
      console.log('🌐 Modo normal activado');
    }

    // Si tenemos un deal válido en modo asesores, guardarlo en el store
    if (context.shouldProcessDeal) {
      console.log('🎯 DealId detectado en modo asesores:', context.dealId);
      setField('dealId', context.dealId);
      // El hook useAsesores se encarga de cargar automáticamente el deal
    }

    // Verificar si hay bypass=true en la URL
    const bypass = searchParams.get('bypass');
    if (bypass === 'true') {
      // Guardar bypass en el store
      setField('bypass', true);
      // Redirigir directamente al formulario (no es comunero)
      navigate('/nuevo-comunero', { replace: true });
    }
  }, [searchParams, navigate, setField]);

  // Efecto para navegar cuando el deal se haya cargado completamente
  useEffect(() => {
    if (isAsesores && hasValidDeal() && !isLoadingDeal && dealData) {
      console.log('✅ Deal cargado completamente, navegando a preguntas adicionales');
      
      // Limpiar flags previos y establecer que venimos de asesores
      sessionStorage.removeItem('datosActualizadosObtenidos');
      sessionStorage.setItem('fromAsesoresDeal', 'true');
      
      // Navegar a preguntas adicionales con los datos prellenados
      navigate('/preguntas-adicionales', {
        state: { 
          fromAsesoresDeal: true,
          dealData: dealData
        },
        replace: true
      });
    }
  }, [isAsesores, hasValidDeal, isLoadingDeal, dealData, navigate]);

  return (
    <ToastProvider>
      <UsuarioProvider>
        {/* Loader específico para deals de asesores */}
        <AsesoresDealLoader />
        
        <div className="d-flex flex-column min-vh-100" style={{background: '#FCFCF7'}}>
          {/* Header */}
          <Header />
          
          {/* Contenido principal */}
          <main className="flex-grow-1 d-flex justify-content-center align-items-start w-100 py-4">
            <AppRoutes onSelect={isComunero => {
              if (isComunero) {
                navigate('/comunero');
              } else {
                navigate('/nuevo-comunero');
              }
            }} />
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </UsuarioProvider>
    </ToastProvider>
  );
}

export default App;

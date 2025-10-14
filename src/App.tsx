import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppRoutes from "./routes/routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastProvider } from "./context/ToastContext";
import { UsuarioProvider } from "./context/UsuarioContext";
import { useFormStore } from "./zustand/formStore";
import { validateAsesoresDealContext, logDomainInfo } from "./utils/domainUtils";
import { bateriaService } from "./services/apiService";

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setField, setValidacionData, setRespuestasPreguntas } = useFormStore();
  const [isLoadingDeal, setIsLoadingDeal] = useState(false);
  const [dealProcessed, setDealProcessed] = useState(false);

  useEffect(() => {
    // Log información del dominio
    logDomainInfo();
    
    // Validar contexto completo de asesores
    const context = validateAsesoresDealContext();
    
    // Configurar modo asesores
    setField('asesores', context.isAsesores);
    (window as any).asesores = context.isAsesores;
    
    console.log(context.isAsesores ? '🎯 Modo asesores' : '🌐 Modo normal');

    // Si tenemos un deal válido Y no se ha procesado
    if (context.shouldProcessDeal && context.dealId && !dealProcessed) {
      console.log('📋 Procesando deal UNA VEZ:', context.dealId);
      setField('dealId', context.dealId);
      procesarDeal(context.dealId);
    }

    // Verificar bypass
    const bypass = searchParams.get('bypass');
    if (bypass === 'true') {
      setField('bypass', true);
      navigate('/nuevo-comunero', { replace: true });
    }
  }, [searchParams, navigate, setField, dealProcessed]);

  const procesarDeal = async (dealId: string) => {
    if (dealProcessed) return;

    setDealProcessed(true);
    setIsLoadingDeal(true);

    try {
      console.log('📡 UNA llamada al backend:', dealId);
      const response = await bateriaService.obtenerDealPorId(dealId);
      
      if (response.success && response.data?.data) {
        console.log('✅ Deal procesado exitosamente');
        
        setValidacionData({
          token: response.data.data.token,
          comunero: response.data.data.comunero,
          enZona: response.data.data.enZona,
          motivo: response.data.data.motivo || '',
          propuestaId: response.data.data.propuestaId,
          analisisTratos: response.data.data.analisisTratos,
          dealId: response.data.data.dealId
        });
        
        if (response.data.data.respuestasPreguntas) {
          setRespuestasPreguntas(response.data.data.respuestasPreguntas);
        }
        
        setField('fromAsesoresDeal', true);
        
        navigate('/preguntas-adicionales', { replace: true });
      }
    } catch (error) {
      console.error('❌ Error procesando deal:', error);
    } finally {
      setIsLoadingDeal(false);
    }
  };

  // Mostrar loader si está cargando deal
  if (isLoadingDeal) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5>Cargando información del deal...</h5>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <UsuarioProvider>
        <div className="d-flex flex-column min-vh-100" style={{background: '#FCFCF7'}}>
          <Header />
          
          <main className="flex-grow-1 d-flex justify-content-center align-items-start w-100 py-4">
            <AppRoutes onSelect={isComunero => {
              if (isComunero) {
                navigate('/comunero');
              } else {
                navigate('/nuevo-comunero');
              }
            }} />
          </main>
          
          <Footer />
        </div>
      </UsuarioProvider>
    </ToastProvider>
  );
}

export default App;
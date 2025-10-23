import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes/routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastProvider } from "./context/ToastContext";
import { UsuarioProvider } from "./context/UsuarioContext";
import { useFormStore } from "./zustand/formStore";
import { validateAsesoresDealContext, logDomainInfo } from "./utils/domainUtils";

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setField, form } = useFormStore();


  useEffect(() => {
    // Log información del dominio
    logDomainInfo();
    
    // Capturar parámetros UTM de la URL
    const utmParams = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_term: searchParams.get('utm_term') || '',
      utm_content: searchParams.get('utm_content') || '',
    };

    // Guardar parámetros UTM en el store
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        setField(key as keyof typeof utmParams, value);
        console.log(`📊 UTM capturado: ${key}=${value}`);
      }
    });

    // También mantener los campos legacy
    const utmSource = searchParams.get('utm_source');
    const campaignSource = searchParams.get('campaign_source') || searchParams.get('utm_source');
    
    if (utmSource) {
      setField('utm', utmSource);
    }
    if (campaignSource) {
      setField('campaignSource', campaignSource);
    }
    
    // Validar contexto completo de asesores
    const context = validateAsesoresDealContext();
    
    // Configurar modo asesores
    setField('asesores', context.isAsesores);
    (window as any).asesores = context.isAsesores;
    
    console.log(context.isAsesores ? '🎯 Modo asesores' : '🌐 Modo normal');

    // DESHABILITADO: El dealId ahora se procesa desde HomeSelector input
    // if (context.shouldProcessDeal && context.dealId && !dealProcessed) {
    //   console.log('📋 Procesando deal UNA VEZ:', context.dealId);
    //   setField('dealId', context.dealId);
    //   procesarDeal(context.dealId);
    // }

    // Verificar bypass
    const bypass = searchParams.get('form');
    if (bypass === 'true') {
      setField('bypass', true);
      navigate('/nuevo-comunero', { replace: true });
    }
  }, [searchParams, navigate, setField]);

  // if(!form.bypass){
  //   return null;
  // }
  // Mostrar loader si está cargando deal
  // if (isLoadingDeal) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center vh-100">
  //       <div className="text-center">
  //         <div className="spinner-border text-primary mb-3" role="status">
  //           <span className="visually-hidden">Cargando...</span>
  //         </div>
  //         <h5>Cargando información del deal...</h5>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ToastProvider>
      <UsuarioProvider>
        <div className="d-flex flex-column min-vh-100" style={{background: 'white'}}>
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./routes/routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastProvider } from "./context/ToastContext";
import { UsuarioProvider } from "./context/UsuarioContext";
import { useFormStore } from "./zustand/formStore";


function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setField } = useFormStore();

  useEffect(() => {
    // Verificar si hay bypass=true en la URL
    const bypass = searchParams.get('bypass');
    if (bypass === 'true') {
      // Guardar bypass en el store
      setField('bypass', true);
      // Redirigir directamente al formulario (no es comunero)
      navigate('/nuevo-comunero', { replace: true });
    }
  }, [searchParams, navigate, setField]);

  return (
    <ToastProvider>
      <UsuarioProvider>
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

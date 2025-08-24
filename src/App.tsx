import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { ToastProvider } from "./context/ToastContext";
import { UsuarioProvider } from "./context/UsuarioContext";


function App() {
  const navigate = useNavigate();

  return (
    <ToastProvider>
      <UsuarioProvider>
        <div className="d-flex justify-content-center align-items-center min-vh-100 w-100" style={{background: '#FCFCF7'}}>
          <AppRoutes onSelect={isComunero => {
            if (isComunero) {
              navigate('/comunero');
            } else {
              navigate('/nuevo-comunero');
            }
          }} />
        </div>
      </UsuarioProvider>
    </ToastProvider>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuario } from '../context/UsuarioContext';
import { useToast } from '../context/ToastContext';
import { nuevoComuneroService } from '../services/apiService';
import PageTransition from './PageTransition';

const ClienteViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setValidacionData } = useUsuario();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const cargarDatosCliente = async () => {
      if (!id) {
        setError('ID de cliente no válido');
        return;
      }

      // Evitar múltiples cargas para el mismo ID
      if (hasLoadedRef.current) {
        console.log(`⚠️  Ya se cargaron los datos para cliente: ${id}`);
        return;
      }

      hasLoadedRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔍 Cargando datos para cliente: ${id}`);
        const response = await nuevoComuneroService.obtenerPorId(id);
        
        if (response.success && response.data) {
          // Crear estructura de validación completa como si viniera del backend
          const validacionCompleta = {
            token: 'cliente-viewer-token', // Token simulado para navegación
            comunero: response.data.comunero,
            enZona: "inZone" as const, // Asumir que está en zona
            motivo: undefined,
            propuestaId: undefined,
            analisisTratos: undefined
          };
          
          // Configurar datos del usuario y validación
          setValidacionData(validacionCompleta);
          
          // Redirigir directamente a preguntas adicionales para usuarios en zona
          navigate('/preguntas-adicionales');
        } else {
          setError('No se pudieron cargar los datos del cliente');
          showToast('Cliente no encontrado o datos no válidos', 'error');
        }
      } catch (err) {
        console.error('Error cargando cliente:', err);
        setError('Error de conexión al cargar los datos');
        showToast('Error al conectar con el servidor', 'error');
        hasLoadedRef.current = false; // Resetear en caso de error
      } finally {
        setLoading(false);
      }
    };

    // Resetear flag cuando cambie el ID
    hasLoadedRef.current = false;
    cargarDatosCliente();
  }, [id]); // Solo dependencia del ID

  if (loading) {
    return (
      <PageTransition>
        <style>{`
          .solar-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
          }
          
          .sun-icon {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: solar-pulse 2s ease-in-out infinite;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            position: relative;
            margin-bottom: 2rem;
          }
          
          .sun-icon::before {
            content: '';
            position: absolute;
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
            animation: solar-glow 3s ease-in-out infinite alternate;
          }
          
          .sun-rays {
            position: absolute;
            width: 200px;
            height: 200px;
          }
          
          .ray {
            position: absolute;
            width: 4px;
            height: 25px;
            background: linear-gradient(to bottom, #FFD700, transparent);
            border-radius: 2px;
            transform-origin: 2px 100px;
            animation: solar-rotate 4s linear infinite;
          }
          
          .ray:nth-child(1) { transform: rotate(0deg); }
          .ray:nth-child(2) { transform: rotate(45deg); }
          .ray:nth-child(3) { transform: rotate(90deg); }
          .ray:nth-child(4) { transform: rotate(135deg); }
          .ray:nth-child(5) { transform: rotate(180deg); }
          .ray:nth-child(6) { transform: rotate(225deg); }
          .ray:nth-child(7) { transform: rotate(270deg); }
          .ray:nth-child(8) { transform: rotate(315deg); }
          
          .loading-text {
            color: #2c3e50;
            font-weight: 600;
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            animation: fade-pulse 1.5s ease-in-out infinite alternate;
          }
          
          .loading-subtext {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 2rem;
          }
          
          .progress-bar-solar {
            width: 250px;
            height: 6px;
            background: rgba(255, 215, 0, 0.2);
            border-radius: 3px;
            overflow: hidden;
            position: relative;
          }
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #FFD700, #FFA500, #FF8C00);
            border-radius: 3px;
            animation: solar-progress 2s ease-in-out infinite;
          }
          
          @keyframes solar-pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
            }
          }
          
          @keyframes solar-glow {
            0% { 
              transform: scale(1);
              opacity: 0.3;
            }
            100% { 
              transform: scale(1.1);
              opacity: 0.1;
            }
          }
          
          @keyframes solar-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes fade-pulse {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
          }
          
          @keyframes solar-progress {
            0% { 
              transform: translateX(-100%);
              opacity: 0.8;
            }
            50% {
              opacity: 1;
            }
            100% { 
              transform: translateX(250px);
              opacity: 0.8;
            }
          }
          
          .brand-section {
            text-align: center;
            margin-top: 2rem;
          }
          
          .brand-logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
          }
          
          .brand-tagline {
            color: #6c757d;
            font-size: 0.85rem;
            font-style: italic;
          }
        `}</style>
        
        <div className="solar-loading">
          <div className="sun-icon">
            <div className="sun-rays">
              <div className="ray"></div>
              <div className="ray"></div>
              <div className="ray"></div>
              <div className="ray"></div>
              <div className="ray"></div>
              <div className="ray"></div>
              <div className="ray"></div>
              <div className="ray"></div>
            </div>
            <span style={{ fontSize: '3rem', zIndex: 2 }}>☀️</span>
          </div>
          
          <div className="loading-text">Cargando tu información...</div>
          <div className="loading-subtext">Preparando tu propuesta de energía solar personalizada</div>
          
          <div className="progress-bar-solar">
            <div className="progress-fill"></div>
          </div>
          
          <div className="brand-section">
            <div className="brand-logo">🌱 Comunidad Solar</div>
            <div className="brand-tagline">Energía limpia para un futuro sostenible</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
  }

  return (
    <PageTransition>
      <div className="container py-5">
        <div className="text-center">
          <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
            <span style={{fontSize: '2.5rem'}}>⚠️</span>
          </div>
          <h2 className="h4 fw-bold mb-3">No se pudo cargar la información</h2>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ClienteViewer;

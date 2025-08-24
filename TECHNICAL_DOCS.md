# Documentación Técnica Detallada

## 🔧 Implementación de Componentes

### CodeInput Component

```typescript
// Uso del componente
<CodeInput 
  length={6}
  value={code}
  onChange={setCode}
  onComplete={(finalCode) => handleSubmit(finalCode)}
/>
```

**Features implementadas:**
- Auto-focus siguiente input
- Backspace inteligente 
- Paste support (distribuye caracteres)
- Solo números
- Navegación con flechas

### PageTransition Component

```typescript
// Wrapper para todas las páginas
<PageTransition>
  <div>Contenido de la página</div>
</PageTransition>
```

**Configuración de animación:**
- Transform: translateY(8px → 0px)
- Opacity: 0 → 1
- Duration: 0.3s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

## 🎨 Sistema de Estilos

### Clases CSS Personalizadas

```css
/* Animaciones sutiles */
.fade-in-result {
  opacity: 0 → 1;
  transform: translateY(5px → 0);
  transition: all 0.3s ease-out;
}

.button-hover-result:hover {
  transform: translateY(-0.5px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.08);
}

.card-glow-result {
  box-shadow: 0 2px 15px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s ease;
}
```

### Bootstrap Overrides

```css
/* Botones con gradientes */
.btn-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff8500 100%);
}
```

## 📡 Configuración APIs

### Google Places API

```typescript
// Hook personalizado
const { predictions, loading } = useGooglePlaces(query);

// Configuración
const GOOGLE_CONFIG = {
  types: ['address'],
  componentRestrictions: { country: 'es' },
  fields: ['formatted_address', 'geometry', 'name']
};
```

**Fallback Strategy:**
1. Google API disponible → Usar servicio real
2. API key faltante → Mock data
3. Error de red → Cache local

### Backend Simulation

```typescript
// apiService.ts
const SIMULATE_BACKEND = true;

// Respuestas simuladas basadas en código
const getSimulatedResponse = (code: string) => {
  if (code.startsWith('0')) {
    return { enZona: false, motivo: 'Zona sin cobertura' };
  }
  return { enZona: true };
};
```

## 🗃️ Gestión de Estado

### Usuario Context

```typescript
// Estado completo del usuario
const userState = {
  usuario: Usuario | null,
  validacionData: ValidacionResponse | null,
  setValidacionData: (data) => void,
  updateUsuario: (data) => void,
  logout: () => void
};

// Persistencia automática
useEffect(() => {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}, [usuario]);
```

### Toast Context

```typescript
// Queue de notificaciones
const toastQueue = {
  toasts: Toast[],
  showToast: (message, type) => void,
  removeToast: (id) => void
};

// Auto-dismiss
useEffect(() => {
  const timer = setTimeout(() => removeToast(id), 5000);
  return () => clearTimeout(timer);
}, [id]);
```

## 🔄 Flujo de Datos

### Navegación con Estado

```typescript
// Pasar datos entre rutas
navigate('/comunero/validar', { 
  state: { email } 
});

// Recibir en destino
const location = useLocation();
const email = location.state?.email;
```

### Validaciones en Cadena

```typescript
// 1. Email válido
const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 2. Código 6 dígitos
const isValidCode = /^\d{6}$/.test(code);

// 3. Campos obligatorios
const requiredFields = ['tipoInstalacion', 'tieneBaterias'];
const isComplete = requiredFields.every(field => usuario[field]);
```

## 🎯 Patterns Utilizados

### Custom Hooks Pattern

```typescript
// useGooglePlaces.ts
export const useGooglePlaces = (input: string) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedInput = useDebounce(input, 300);
  
  useEffect(() => {
    if (debouncedInput) {
      searchPlaces(debouncedInput);
    }
  }, [debouncedInput]);
  
  return { predictions, loading };
};
```

### Compound Components Pattern

```typescript
// ResultadoValidacion.tsx
const ResultComponent = () => (
  <div>
    <Header status={status} />
    <UserDataCard editMode={editMode} />
    <ActionButtons onContinue={handleContinue} />
  </div>
);
```

### Provider Pattern

```typescript
// App.tsx
<ToastProvider>
  <UsuarioProvider>
    <Router>
      <Routes />
    </Router>
  </UsuarioProvider>
</ToastProvider>
```

## 🚀 Optimizaciones

### Performance

```typescript
// Debounce para búsquedas
const debouncedSearch = useDebounce(searchTerm, 300);

// Lazy loading de componentes
const Propuesta = lazy(() => import('./components/Propuesta'));

// Memorización de callbacks
const handleSubmit = useCallback((data) => {
  // ... lógica
}, [dependencies]);
```

### Bundle Size

```typescript
// Import específicos
import { useState, useEffect } from 'react';

// Tree shaking
import { debounce } from 'lodash/debounce';

// Code splitting
const routes = [
  {
    path: '/propuesta',
    component: lazy(() => import('./pages/Propuesta'))
  }
];
```

## 🔍 Testing Strategy

### Unit Tests

```typescript
// Components
describe('CodeInput', () => {
  test('should handle 6 digit input', () => {
    // ... test logic
  });
});

// Hooks
describe('useGooglePlaces', () => {
  test('should debounce API calls', () => {
    // ... test logic
  });
});
```

### Integration Tests

```typescript
// User flows
describe('Validation Flow', () => {
  test('should complete full validation process', () => {
    // 1. Enter email
    // 2. Enter code
    // 3. Fill additional data
    // 4. Navigate to proposal
  });
});
```

## 📋 Checklist de Deploy

### Pre-Deploy
- [ ] `SIMULATE_BACKEND = false`
- [ ] Variables de entorno configuradas
- [ ] Google API key válida
- [ ] Build sin errores TypeScript
- [ ] Tests pasando

### Deploy
- [ ] `npm run build`
- [ ] Assets estáticos servidos
- [ ] Routing SPA configurado
- [ ] HTTPS habilitado

### Post-Deploy
- [ ] Validar flujo completo
- [ ] Verificar APIs externas
- [ ] Monitorear errores frontend
- [ ] Performance metrics

---

*Documentación para desarrolladores - Versión 1.0*

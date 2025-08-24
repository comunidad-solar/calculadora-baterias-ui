# Calculadora Baterías UI

Sistema de validación y propuestas para comuneros con integración de Google Places API.

## 🚀 Tecnologías

- **React 18** + **TypeScript** + **Vite**
- **Bootstrap 5** para estilos
- **React Router** para navegación
- **Context API** para estado global
- **Google Places API** para direcciones

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── BackButton.tsx   # Botón volver reutilizable
│   ├── CodeInput.tsx    # Input código 6 dígitos
│   ├── ComuneroEmailForm.tsx     # Formulario email inicial
│   ├── ComuneroCodigoForm.tsx    # Validación código
│   ├── GoogleAddressInput.tsx    # Autocomplete direcciones
│   ├── PageTransition.tsx        # Transiciones entre vistas
│   ├── ResultadoValidacion.tsx   # Página resultado validación
│   └── Propuesta.tsx    # Página propuesta (placeholder)
├── context/             # Contextos React
│   ├── ToastContext.tsx # Sistema notificaciones
│   └── UsuarioContext.tsx        # Estado usuario global
├── hooks/               # Custom hooks
│   └── useGooglePlaces.ts        # Hook Google Places API
├── services/            # Servicios API
│   └── apiService.ts    # Simulación backend + API calls
└── routes.tsx          # Configuración rutas
```

## 🛠 Configuración Inicial

### 1. Instalación
```bash
npm install
```

### 2. Variables de Entorno
Crear archivo `.env`:
```
VITE_GOOGLE_MAPS_API_KEY=tu_clave_google_maps
```

### 3. Ejecutar Desarrollo
```bash
npm run dev
```

## 🔧 Componentes Principales

### ComuneroEmailForm
- **Propósito**: Captura y valida email inicial
- **Features**: Autocompletado dominios, validación
- **Navegación**: → ComuneroCodigoForm

### ComuneroCodigoForm
- **Propósito**: Verificación código 6 dígitos
- **Features**: Input individual por dígito, paste support
- **Navegación**: → ResultadoValidacion

### ResultadoValidacion
- **Propósito**: Muestra resultado validación + formulario datos
- **Features**: Modo edición, campos obligatorios, validaciones
- **Estados**: En zona / Fuera de zona
- **Navegación**: → Propuesta (si en zona)

### GoogleAddressInput
- **Propósito**: Autocomplete direcciones con Google Places
- **Features**: Debounced search, fallback mock data
- **Dependencia**: Google Maps API

## 📊 Contextos

### UsuarioContext
```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoInstalacion?: 'monofasica' | 'trifasica' | 'desconozco';
  tieneBaterias?: boolean;
}
```

### ToastContext
- **Tipos**: success, error, warning, info
- **Auto-dismiss**: 5 segundos
- **Uso**: `showToast(message, type)`

## 🔀 Flujo de Usuario

```
EmailForm → CodigoForm → ResultadoValidacion → Propuesta
    ↓           ↓              ↓                 ↓
  Email     Código 6d.    Datos usuario    Calculadora
validation  validation    + validaciones   (placeholder)
```

## 🎨 Sistema de Animaciones

### PageTransition
- **Entrada**: Fade-in + translateY(8px)
- **Duración**: 0.3s
- **Timing**: cubic-bezier(0.4, 0, 0.2, 1)

### Componentes Animados
- Hovers sutiles (0.5px elevation)
- Transiciones suaves entre estados
- Loading spinners en botones

## ⚙️ Configuración Backend

### Simulación (apiService.ts)
```typescript
const SIMULATE_BACKEND = true; // Cambiar a false para backend real
```

### Códigos de Prueba
- Códigos que empiecen con **'0'**: Usuario fuera de zona
- Otros códigos: Usuario en zona de cobertura

### Endpoints Esperados
```
POST /api/comunero/validar-email
POST /api/comunero/validar-codigo
PUT /api/comunero/actualizar-datos
```

## 📝 Validaciones

### Campos Obligatorios (usuarios en zona)
- ✅ Tipo de instalación
- ✅ ¿Ya tienes baterías instaladas?

### Validaciones Email
- Formato email válido
- Dominios comunes sugeridos

### Validaciones Código
- Exactamente 6 dígitos
- Solo números

## 🎯 Estados de Usuario

### En Zona de Cobertura
- Acceso a formulario completo
- Campos adicionales obligatorios
- Navegación a propuesta

### Fuera de Zona
- Solo datos básicos
- Contacto con asesor
- Sin acceso a propuesta

## 🔒 Persistencia

- **localStorage**: Usuario + validación data
- **Restauración**: Al recargar página
- **Limpieza**: Al hacer logout

## 📱 Responsive

- **Bootstrap 5**: Grid system y componentes
- **Breakpoints**: Mobile-first approach
- **Animaciones**: Optimizadas para móviles

## 🚨 Manejo de Errores

### Toast Notifications
- Errores de red
- Validaciones fallidas
- Confirmaciones de éxito

### Fallbacks
- Google API → Mock data
- Backend offline → Simulación
- Datos faltantes → Estados por defecto

## 🔄 Próximos Desarrollos

### Propuesta Component
- Calculadora solar
- Generación PDF
- Integración sistema precios

### Backend Integration
- Cambiar `SIMULATE_BACKEND = false`
- Implementar endpoints reales
- Autenticación JWT

### Features Adicionales
- Multi-idioma
- Más tipos instalación
- Historial propuestas

## 🐛 Debugging

### Console Logs
```typescript
// Activar en desarrollo
console.log('ValidationResponse:', response);
```

### Estados React DevTools
- UsuarioContext state
- Toast notifications queue
- Component render cycles

---

**Nota**: Documentación actualizada para versión con animaciones suaves y validaciones completas.

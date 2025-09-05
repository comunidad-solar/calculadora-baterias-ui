# Header Component - Lógica de Visibilidad

## Resumen
El Header component utiliza la misma lógica de visibilidad que el Footer, controlada por el parámetro `bypass` del Zustand store y la prop opcional `showHeader`.

## Lógica de Visibilidad

### Casos de uso:

1. **Modo bypass (bypass = true)**:
   - `showHeader` no definido → NO se muestra (por defecto false)
   - `showHeader = false` → NO se muestra  
   - `showHeader = true` → SÍ se muestra

2. **Modo normal (bypass = false)**:
   - `showHeader` no definido → SÍ se muestra (por defecto true)
   - `showHeader = false` → NO se muestra
   - `showHeader = true` → SÍ se muestra

### Código de la lógica:
```typescript
const shouldShow = bypass 
  ? showHeader === true  // Solo mostrar si explícitamente es true
  : showHeader !== false; // Mostrar a menos que explícitamente sea false
```

## Ejemplos de uso:

### En modo normal (formulario estándar):
```tsx
<Header /> // Se muestra
<Header showHeader={true} /> // Se muestra
<Header showHeader={false} /> // NO se muestra
```

### En modo bypass (URL con ?bypass=true):
```tsx
<Header /> // NO se muestra
<Header showHeader={true} /> // Se muestra
<Header showHeader={false} /> // NO se muestra
```

## Características del Header:

- **Logo**: Logo oficial de Comunidad Solar en color (50px de altura)
- **Navegación**: Enlaces a secciones principales con dropdown para Soluciones
- **Contador**: "3.375 comuneros" con icono verde
- **CTA**: Botón de contacto en verde (#79BC1C)
- **Diseño**: Fondo blanco (#ffffff), texto oscuro, tipografía Work Sans
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Integración:
El Header está integrado en `App.tsx` en la parte superior del layout, por encima del contenido principal.

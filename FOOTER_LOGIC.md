# Lógica del Footer

## Casos de uso del Footer basado en bypass y showFooter

### Tabla de casos:

| bypass | showFooter | Resultado |
|--------|------------|-----------|
| `true` | `undefined` | ❌ No mostrar (por defecto false cuando bypass=true) |
| `true` | `false` | ❌ No mostrar |
| `true` | `true` | ✅ Mostrar |
| `false` | `undefined` | ✅ Mostrar (por defecto true cuando bypass=false) |
| `false` | `false` | ❌ No mostrar |
| `false` | `true` | ✅ Mostrar |

### Lógica implementada:

```typescript
const shouldShow = bypass 
  ? showFooter === true  // Solo mostrar si explícitamente es true
  : showFooter !== false; // Mostrar a menos que explícitamente sea false
```

### Ejemplos de uso:

```jsx
// Caso normal - mostrar footer solo si bypass=false
<Footer />

// Forzar mostrar footer incluso con bypass=true
<Footer showFooter={true} />

// Forzar ocultar footer incluso con bypass=false
<Footer showFooter={false} />
```

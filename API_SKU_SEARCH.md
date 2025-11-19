# API de Búsqueda de SKU

## Endpoint

```
POST /baterias/search-sku
```

## Request Body

```json
{
  "sku": "BAT-SOLAX-5KW",
  "propuestaId": "230641000123456789"
}
```

### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `sku` | string | Sí | Código SKU del producto a buscar |
| `propuestaId` | string | Sí | ID de la propuesta/deal en Zoho CRM |

## Response - Éxito

```json
{
  "success": true,
  "data": {
    "sku": "BAT-SOLAX-5KW",
    "nombre": "Batería SolaX 5kWh",
    "descripcion": "Batería de litio SolaX Triple Power 5kWh",
    "precio": 2499.00,
    "stock": 15,
    "categoria": "Baterías",
    "zoho_item_id": "230641000123456789"
  }
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la operación fue exitosa |
| `data.sku` | string | Código SKU del producto |
| `data.nombre` | string | Nombre del producto |
| `data.descripcion` | string | (Opcional) Descripción detallada del producto |
| `data.precio` | number | Precio del producto en euros |
| `data.stock` | number | (Opcional) Cantidad disponible en inventario |
| `data.categoria` | string | (Opcional) Categoría del producto |
| `data.zoho_item_id` | string | (Opcional) ID del item en Zoho CRM |

## Response - Error

### Producto no encontrado

```json
{
  "success": false,
  "error": "Producto no encontrado",
  "message": "No se encontró un producto con el SKU especificado"
}
```

### SKU inválido o vacío

```json
{
  "success": false,
  "error": "SKU inválido",
  "message": "El código SKU no puede estar vacío"
}
```

### Propuesta no encontrada

```json
{
  "success": false,
  "error": "Propuesta no encontrada",
  "message": "No se encontró una propuesta con el ID especificado"
}
```

### Error de servidor

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Ocurrió un error al procesar la solicitud"
}
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Producto encontrado |
| 400 | Bad Request - Parámetros faltantes o inválidos |
| 404 | Not Found - Producto o propuesta no encontrada |
| 500 | Internal Server Error - Error del servidor |

## Ejemplo de Uso

### JavaScript/TypeScript

```typescript
const response = await bateriaService.buscarSku('BAT-SOLAX-5KW', '230641000123456789');

if (response.success && response.data) {
  console.log('Producto encontrado:', response.data);
  console.log('Nombre:', response.data.nombre);
  console.log('Precio:', response.data.precio);
} else {
  console.error('Error:', response.error);
}
```

## Notas de Implementación

1. **Búsqueda Case-Insensitive**: El backend debe realizar la búsqueda de SKU sin distinción entre mayúsculas y minúsculas.

2. **Validación de Propuesta**: El backend debe verificar que la propuesta existe y está activa antes de permitir agregar productos.

3. **Stock**: El campo `stock` es opcional pero recomendado para evitar agregar productos sin disponibilidad.

4. **Caché**: Se recomienda implementar caché para búsquedas frecuentes de SKU para mejorar el rendimiento.

5. **Rate Limiting**: Considerar implementar límites de tasa para evitar abusos en las búsquedas.

## Seguridad

- Solo los usuarios con rol de **asesor** pueden acceder a este endpoint
- El `propuestaId` debe pertenecer al asesor autenticado o ser accesible según los permisos
- Se debe validar que el SKU no contenga caracteres maliciosos (SQL injection, XSS, etc.)

---

# API de Agregar Productos por SKU

## Endpoint

```
POST /baterias/add-new-skus
```

## Request Body

```json
{
  "propuestaId": "230641000123456789",
  "productos": [
    {
      "sku": "BAT-SOLAX-5KW",
      "nombre": "Batería SolaX 5kWh",
      "precio": 2499.00,
      "cantidad": 2,
      "zoho_item_id": "230641000123456789"
    },
    {
      "sku": "INV-HYBRID-10KW",
      "nombre": "Inversor Híbrido 10kW",
      "precio": 1899.00,
      "cantidad": 1,
      "zoho_item_id": "230641000123456790"
    }
  ]
}
```

### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `propuestaId` | string | Sí | ID de la propuesta/deal en Zoho CRM |
| `productos` | array | Sí | Array de productos a agregar |
| `productos[].sku` | string | Sí | Código SKU del producto |
| `productos[].nombre` | string | Sí | Nombre del producto |
| `productos[].precio` | number | Sí | Precio unitario del producto |
| `productos[].cantidad` | number | Sí | Cantidad a agregar (mínimo 1) |
| `productos[].zoho_item_id` | string | No | ID del item en Zoho CRM (se obtiene del endpoint search-sku) |

## Response - Éxito

```json
{
  "success": true,
  "data": {
    "propuestaId": "230641000123456789",
    "productosAgregados": 2,
    "montoTotal": 6897.00,
    "montoAnterior": 4699.00,
    "montoNuevo": 11596.00,
    "productos": [
      {
        "sku": "BAT-SOLAX-5KW",
        "nombre": "Batería SolaX 5kWh",
        "precio": 2499.00,
        "cantidad": 2,
        "subtotal": 4998.00,
        "zoho_item_id": "230641000123456789"
      },
      {
        "sku": "INV-HYBRID-10KW",
        "nombre": "Inversor Híbrido 10kW",
        "precio": 1899.00,
        "cantidad": 1,
        "subtotal": 1899.00,
        "zoho_item_id": "230641000123456790"
      }
    ]
  },
  "iaMessage": "Excelente elección. Has agregado una batería SolaX de alta capacidad junto con un inversor híbrido compatible. Esta combinación optimizará el almacenamiento de energía y permitirá un mayor ahorro en la factura eléctrica del cliente.",
  "message": "Productos agregados exitosamente a la propuesta"
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la operación fue exitosa |
| `data.propuestaId` | string | ID de la propuesta actualizada |
| `data.productosAgregados` | number | Cantidad de productos agregados |
| `data.montoTotal` | number | Suma total de los productos agregados |
| `data.montoAnterior` | number | Monto de la propuesta antes de agregar productos |
| `data.montoNuevo` | number | Monto total de la propuesta después de agregar productos |
| `data.productos` | array | Array de productos agregados con detalles |
| `iaMessage` | string | (Opcional) Mensaje generado por IA analizando los productos agregados y la propuesta. **Nota: Este campo viene al mismo nivel que `data`, no dentro de `data`** |
| `data.productos[].sku` | string | Código SKU del producto |
| `data.productos[].nombre` | string | Nombre del producto |
| `data.productos[].precio` | number | Precio unitario |
| `data.productos[].cantidad` | number | Cantidad agregada |
| `data.productos[].subtotal` | number | precio × cantidad |
| `data.productos[].zoho_item_id` | string | (Opcional) ID del item en Zoho CRM |

## Response - Error

### Lista de productos vacía

```json
{
  "success": false,
  "error": "Lista de productos vacía",
  "message": "Debes proporcionar al menos un producto para agregar"
}
```

### Propuesta no encontrada

```json
{
  "success": false,
  "error": "Propuesta no encontrada",
  "message": "No se encontró una propuesta con el ID especificado"
}
```

### Productos sin stock

```json
{
  "success": false,
  "error": "Error al agregar productos",
  "message": "Algunos productos no están disponibles en stock"
}
```

### Error de validación

```json
{
  "success": false,
  "error": "Datos inválidos",
  "message": "Todos los productos deben tener SKU, nombre, precio y cantidad válidos"
}
```

### Error de servidor

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Ocurrió un error al procesar la solicitud"
}
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Productos agregados correctamente |
| 400 | Bad Request - Parámetros faltantes o inválidos |
| 404 | Not Found - Propuesta no encontrada |
| 500 | Internal Server Error - Error del servidor |

## Ejemplo de Uso

### JavaScript/TypeScript

```typescript
const productosSeleccionados = [
  {
    sku: 'BAT-SOLAX-5KW',
    nombre: 'Batería SolaX 5kWh',
    precio: 2499.00,
    cantidad: 2
  },
  {
    sku: 'INV-HYBRID-10KW',
    nombre: 'Inversor Híbrido 10kW',
    precio: 1899.00,
    cantidad: 1
  }
];

const response = await bateriaService.agregarProductosSku(
  '230641000123456789',
  productosSeleccionados
);

if (response.success && response.data) {
  console.log('Productos agregados:', response.data.productosAgregados);
  console.log('Monto anterior:', response.data.montoAnterior);
  console.log('Monto nuevo:', response.data.montoNuevo);
} else {
  console.error('Error:', response.error);
}
```

## Notas de Implementación

1. **Validación de Productos**: El backend debe validar que todos los productos existan y tengan stock disponible antes de agregarlos.

2. **Actualización de Propuesta**: La propuesta en Zoho CRM debe actualizarse con los nuevos productos y el monto total recalculado.

3. **Transaccionalidad**: La operación debe ser atómica - si falla agregar algún producto, se debe revertir toda la operación.

4. **Cálculo de Totales**: 
   - `montoTotal` = suma de (precio × cantidad) de todos los productos agregados
   - `montoNuevo` = `montoAnterior` + `montoTotal`

5. **Historial**: Se recomienda mantener un log/historial de productos agregados manualmente por asesores.

6. **Notificaciones**: Considerar enviar notificación al cliente cuando un asesor modifica su propuesta.

7. **Mensaje IA (iaMessage)**: Campo opcional que puede ser generado por IA para proporcionar contexto al asesor sobre:
   - Compatibilidad entre productos agregados
   - Recomendaciones sobre la configuración
   - Análisis de valor para el cliente
   - Alertas sobre posibles mejoras
   
   Ejemplos de mensajes IA:
   - "Excelente elección. Esta combinación de batería e inversor maximizará el ahorro energético."
   - "Nota: Considera agregar un panel de monitorización para mejorar el seguimiento del sistema."
   - "Esta configuración es ideal para consumos medios-altos y permite autonomía de 6-8 horas."

## Seguridad

- Solo los usuarios con rol de **asesor** pueden acceder a este endpoint
- El `propuestaId` debe pertenecer al asesor autenticado o ser accesible según los permisos
- Validar que las cantidades sean números positivos mayores a 0
- Validar que los precios coincidan con los del catálogo (no permitir precios arbitrarios)
- Considerar límites máximos de productos por propuesta

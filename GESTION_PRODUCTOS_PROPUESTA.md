# Gestión de Productos en Propuestas

## Descripción General

Esta funcionalidad permite a los asesores gestionar los productos/artículos de una propuesta de forma flexible. Pueden agregar, modificar, eliminar y marcar productos como principales directamente desde la interfaz de la propuesta.

## ¿Qué puede hacer un asesor?

### 1. Ver Productos Existentes
Cuando se carga una propuesta (por ejemplo, `/comunero/:idPropuesta`), el sistema automáticamente:
- Obtiene los productos que el backend generó para esa propuesta
- Los muestra en una tabla editable
- Permite visualizar: SKU, nombre, precio, cantidad y subtotal de cada producto

### 2. Buscar y Agregar Nuevos Productos
Los asesores pueden:
- Buscar productos por SKU usando el campo de búsqueda
- Ver los resultados con nombre, precio y disponibilidad
- Agregar productos encontrados a la propuesta con un clic
- El producto se agrega con cantidad inicial de 1

### 3. Modificar Cantidades
Para cada producto en la propuesta:
- Usar botones (+) y (-) para aumentar o disminuir cantidades
- La cantidad mínima es 1
- El subtotal se actualiza automáticamente al cambiar la cantidad
- El total general se recalcula en tiempo real

### 4. Eliminar Productos
- Cada producto tiene un botón "🗑️ Eliminar"
- Al eliminar, el producto se quita de la lista inmediatamente
- El total se ajusta automáticamente

### 5. Marcar Producto Principal
- Cada producto tiene un checkbox pequeño al lado de su nombre
- Solo se puede marcar un producto como principal a la vez
- El producto principal define el título de la propuesta
- Al marcar uno nuevo, el anterior se desmarca automáticamente
- El checkbox incluye un tooltip explicativo al pasar el mouse

### 6. Confirmar Cambios
- Al hacer clic en "Confirmar Productos", se envían todos los cambios al backend
- El backend actualiza la propuesta con la lista completa de productos
- Incluye: SKU, cantidades, y cuál es el producto principal

## Flujo de Trabajo Típico

### Escenario 1: Propuesta Nueva Generada
1. Usuario completa el formulario de preguntas adicionales
2. Sistema genera propuesta automáticamente con productos sugeridos
3. Se hace una segunda llamada para obtener los productos completos
4. Asesor ve la propuesta con productos ya cargados
5. Asesor puede modificar, agregar o quitar productos según necesite
6. Confirma los cambios finales

### Escenario 2: Propuesta Existente
1. Asesor abre una propuesta desde `/comunero/:idPropuesta`
2. Sistema carga los productos actuales de esa propuesta
3. Asesor hace las modificaciones necesarias
4. Confirma para guardar los cambios

## Detalles de la Interfaz

### Tabla de Productos
La tabla muestra:
- **SKU**: Código único del producto
- **Nombre**: Con checkbox de producto principal al lado
- **Precio**: En euros (€)
- **Cantidad**: Controles (+/-) para ajustar
- **Subtotal**: Precio × Cantidad (calculado automáticamente)
- **Acciones**: Botón para eliminar

### Buscador de SKU
- Campo de texto para ingresar el SKU
- Botón "Buscar SKU" para realizar la búsqueda
- Resultados se muestran debajo con información detallada
- Botón "Agregar" en cada resultado encontrado

### Producto Principal
- Checkbox compacto junto al nombre del producto
- Tooltip: "Marcar como producto principal (será el título de la propuesta)"
- Solo uno puede estar seleccionado
- No es obligatorio marcarlo inicialmente
- Solo se marca si viene explícitamente del backend

## Beneficios

1. **Flexibilidad**: Los asesores no están limitados a productos predefinidos
2. **Corrección Fácil**: Si el sistema sugiere productos incorrectos, se pueden cambiar
3. **Personalización**: Cada propuesta puede adaptarse al cliente específico
4. **Control Total**: El asesor tiene la última palabra sobre qué incluir
5. **Interfaz Intuitiva**: Todo se hace desde una sola pantalla sin pasos adicionales

## Sincronización con Backend

El sistema hace dos llamadas importantes:

1. **Al generar propuesta**: 
   - POST `/baterias/comunero/create-proposal` → Crea la propuesta
   - GET `/baterias/comunero/{propuestaId}` → Obtiene productos completos

2. **Al confirmar productos**:
   - POST `/baterias/add-new-skus` → Actualiza la lista completa de productos
   - Incluye información sobre cuál es el producto principal

Esto asegura que los datos siempre estén sincronizados entre el frontend y el backend.

## Casos Especiales

- **Sin productos iniciales**: El asesor puede empezar desde cero buscando y agregando
- **Búsqueda sin resultados**: El sistema muestra un mensaje apropiado
- **Productos sin SKU del backend**: Se generan IDs temporales automáticamente
- **Navegación sin pérdida de datos**: Los cambios se mantienen en el estado hasta confirmar

## Notas Técnicas para el Equipo

- Los productos se cargan desde `location.state.propuestaItems` o desde `propuestaData`
- El estado se maneja con React hooks (`useState`)
- La validación de producto principal usa un `map` para asegurar exclusividad
- Los precios y totales se formatean con separadores de miles
- La estructura de datos incluye: `sku`, `nombre`, `precio`, `cantidad`, `zoho_item_id`, `productoPrincipal`

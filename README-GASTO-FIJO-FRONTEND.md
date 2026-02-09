# 📋 README: Cambios en Gasto Fijo - Guía de Implementación Frontend

Este documento describe los cambios realizados en la API de **Gasto Fijo** y qué debe implementar el frontend.

---

## 🎯 Resumen Ejecutivo

1. ✅ **Nuevo campo `activo`** en Gasto Fijo (para activar/desactivar gastos por mes)
2. ✅ **Nuevo endpoint** para obtener pagos por mes (`/gasto-fijo-pago/por-info-inicial`)
3. ✅ **Cambio en `mis-gastos-fijos`**: ya no devuelve el array `pagos`
4. ✅ **Lógica mejorada** al marcar pagos como pagados

---

## 1️⃣ Campo `activo` en Gasto Fijo

### ¿Qué es?
Permite activar/desactivar un gasto fijo. Útil para gastos que se pagan algunos meses y otros no.

### 📝 Cambios en Tipos/Interfaces

**Actualizar todas las interfaces de Gasto Fijo:**

```typescript
interface GastoFijo {
  id: number;
  nombre: string;
  monto: number; // o montoFijo
  activo: boolean; // ⬅️ NUEVO CAMPO
  categoria: Categoria;
  esDebitoAutomatico: boolean;
  medioPago?: MedioPago;
}

// También en MisGastosFijosDTO
interface MisGastosFijos {
  id: number;
  nombre: string;
  monto: number;
  activo: boolean; // ⬅️ NUEVO CAMPO
  categoria: Categoria;
  // ❌ Ya NO viene el array 'pagos' aquí
}
```

### 🔧 Endpoints Afectados

#### GET `/gasto-fijo/search`
**Respuesta:** Cada ítem en `data` ahora incluye `activo: boolean`

**Query opcional:**
```typescript
// Filtrar solo activos
GET /gasto-fijo/search?activo=true

// Filtrar solo inactivos
GET /gasto-fijo/search?activo=false

// Todos (sin filtro)
GET /gasto-fijo/search
```

#### GET `/gasto-fijo/mis-gastos-fijos`
**Respuesta:** Cada ítem en `gastosFijos` ahora incluye `activo: boolean`

**Ejemplo de respuesta:**
```json
{
  "usuario": { ... },
  "gastosFijos": [
    {
      "id": 1,
      "nombre": "Internet/WiFi",
      "monto": 27000,
      "activo": true,  // ⬅️ NUEVO
      "categoria": { ... }
    }
  ],
  "metadata": { ... }
}
```

#### POST `/gasto-fijo` (Crear)
**⚠️ IMPORTANTE:** NO enviar `activo` en el body. Se crea siempre con `activo: true` por defecto.

```typescript
// ✅ CORRECTO
const crearGastoFijo = {
  nombre: "Internet/WiFi",
  montoFijo: 27000,
  categoriaId: 1,
  esDebitoAutomatico: false
  // NO incluir 'activo'
};

// ❌ INCORRECTO
const crearGastoFijo = {
  nombre: "Internet/WiFi",
  montoFijo: 27000,
  activo: true  // ❌ No enviar esto
};
```

#### PATCH `/gasto-fijo/:id` (Editar)
**✅ SÍ se puede enviar `activo`** para cambiar el estado.

```typescript
// Activar/desactivar un gasto fijo
PATCH /gasto-fijo/1
Body: {
  "activo": false  // o true
}
```

### 🎨 Implementación en UI

**Pantalla de listado:**
- Agregar columna/toggle para mostrar `activo`
- Opcional: filtro para mostrar solo activos/inactivos

**Pantalla de edición:**
- Agregar checkbox/toggle para cambiar `activo`
- Enviar `activo` en el PATCH cuando el usuario lo cambie

**Ejemplo React:**
```tsx
// En el formulario de edición
<FormControlLabel
  control={
    <Switch
      checked={gastoFijo.activo}
      onChange={(e) => setGastoFijo({ ...gastoFijo, activo: e.target.checked })}
    />
  }
  label="Gasto activo"
/>

// Al guardar
await updateGastoFijo(id, { activo: gastoFijo.activo });
```

---

## 2️⃣ Nuevo Endpoint: Pagos por Mes

### 🆕 Endpoint Nuevo

```
GET /gasto-fijo-pago/por-info-inicial?infoInicialId={id}
```

**Propósito:** Obtener todos los gastos fijos del usuario con su pago correspondiente a un mes específico.

### 📥 Request

```typescript
// Ejemplo de llamada
const infoInicialId = 1; // ID del mes/año seleccionado
const response = await fetch(
  `/api/gasto-fijo-pago/por-info-inicial?infoInicialId=${infoInicialId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

### 📤 Response

```typescript
interface PagosGastoFijoDTO {
  infoInicial: {
    id: number;
    usuario: Usuario;
    anio: number;
    mes: string; // "FEBRERO"
    mediosPago: MedioPago[];
    montoTotal: number;
  };
  pagos: Array<{
    gastoFijo: {
      id: number;
      nombre: string;
      montoFijo: number;
      activo: boolean;  // ⬅️ Incluye activo
      categoria: Categoria;
    };
    pago: {
      id?: number;  // ⬅️ Puede ser undefined si no existe registro
      montoPago: number;
      pagado: boolean;
    };
  }>;
}
```

**Ejemplo de respuesta:**
```json
{
  "infoInicial": {
    "id": 1,
    "anio": 2026,
    "mes": "FEBRERO",
    "montoTotal": 76271.62
  },
  "pagos": [
    {
      "gastoFijo": {
        "id": 1,
        "nombre": "Internet/WiFi",
        "montoFijo": 27000,
        "activo": true
      },
      "pago": {
        "id": 1,
        "montoPago": 27000,
        "pagado": false
      }
    },
    {
      "gastoFijo": {
        "id": 2,
        "nombre": "Luz",
        "montoFijo": 15000,
        "activo": true
      },
      "pago": {
        "id": undefined,  // ⬅️ Aún no se creó registro de pago
        "montoPago": 0,
        "pagado": false
      }
    }
  ]
}
```

### 🎯 Casos de Uso

**Pantalla "Gastos Fijos del Mes":**
1. Usuario selecciona un mes (info inicial)
2. Llamar a este endpoint con el `infoInicialId`
3. Mostrar lista de gastos fijos con su estado de pago

**Ejemplo React:**
```tsx
const [pagos, setPagos] = useState<PagosGastoFijoDTO | null>(null);

useEffect(() => {
  if (infoInicialId) {
    fetchPagosPorMes(infoInicialId);
  }
}, [infoInicialId]);

const fetchPagosPorMes = async (infoInicialId: number) => {
  const response = await api.get(`/gasto-fijo-pago/por-info-inicial?infoInicialId=${infoInicialId}`);
  setPagos(response.data);
};

// Renderizar lista
{pagos?.pagos.map((item) => (
  <div key={item.gastoFijo.id}>
    <span>{item.gastoFijo.nombre}</span>
    <span>${item.pago.montoPago}</span>
    <Checkbox checked={item.pago.pagado} />
    {/* Si item.pago.id existe, se puede editar */}
    {item.pago.id && (
      <Button onClick={() => editarPago(item.pago.id)}>Editar</Button>
    )}
  </div>
))}
```

---

## 3️⃣ Cambio en `GET /gasto-fijo/mis-gastos-fijos`

### ⚠️ Cambio Importante

**ANTES:**
```typescript
// Cada gasto fijo incluía el array 'pagos'
{
  id: 1,
  nombre: "Internet/WiFi",
  monto: 27000,
  pagos: [  // ⬅️ Ya NO viene esto
    { id: 1, montoPago: 27000, pagado: false, ... },
    { id: 2, montoPago: 27000, pagado: true, ... }
  ]
}
```

**AHORA:**
```typescript
// Ya NO viene el array 'pagos'
{
  id: 1,
  nombre: "Internet/WiFi",
  monto: 27000,
  activo: true,  // ⬅️ Ahora viene esto
  categoria: { ... }
  // ❌ NO viene 'pagos'
}
```

### 🔧 Qué Hacer

1. **Eliminar** la referencia a `pagos` en las interfaces de `MisGastosFijosDTO`
2. **Si necesitas pagos por mes**, usar el nuevo endpoint:
   ```
   GET /gasto-fijo-pago/por-info-inicial?infoInicialId={id}
   ```

**Ejemplo de migración:**
```typescript
// ❌ ANTES (ya no funciona)
interface MisGastosFijos {
  pagos: GastoFijoPago[];  // Eliminar esto
}

// ✅ AHORA
interface MisGastosFijos {
  id: number;
  nombre: string;
  monto: number;
  activo: boolean;
  categoria: Categoria;
  // Sin 'pagos'
}

// Si necesitas pagos, usar el nuevo endpoint
const pagosDelMes = await getPagosPorInfoInicial(infoInicialId);
```

---

## 4️⃣ Marcar Pago como Pagado

### 🔄 Lógica del Backend

Al marcar un pago como pagado (`PATCH /gasto-fijo-pago/:id` con `pagado: true`):

**Caso 1:** Gasto fijo tiene `montoFijo > 0` y pago tiene `montoPago === 0`
- ✅ Backend usa automáticamente `montoFijo` como `montoPago`
- ✅ Puedes enviar solo `{ "pagado": true }`

**Caso 2:** Gasto fijo NO tiene monto fijo (o es 0) y pago está en 0
- ⚠️ Backend **exige** que envíes `montoPago` en el body
- ❌ Si no lo envías, responde error

### 💻 Implementación

```typescript
// Función para marcar como pagado
const marcarComoPagado = async (pagoId: number, gastoFijo: GastoFijo, pagoActual: Pago) => {
  const body: UpdateGastoFijoPagoRequestDto = {
    pagado: true
  };

  // Si el gasto NO tiene montoFijo y el pago está en 0, pedir monto al usuario
  if ((!gastoFijo.montoFijo || gastoFijo.montoFijo === 0) && pagoActual.montoPago === 0) {
    // Mostrar input para que el usuario ingrese el monto
    const montoIngresado = await pedirMontoAlUsuario(); // Tu función
    body.montoPago = montoIngresado;
  }

  await api.patch(`/gasto-fijo-pago/${pagoId}`, body);
};
```

**Ejemplo React:**
```tsx
const handleMarcarPagado = async (item: Pagos) => {
  if (!item.pago.id) {
    // Primero crear el pago si no existe
    // (esto depende de tu implementación)
    return;
  }

  const body: any = { pagado: true };

  // Si no hay monto fijo y el pago está en 0, pedir monto
  if (
    (!item.gastoFijo.montoFijo || item.gastoFijo.montoFijo === 0) &&
    item.pago.montoPago === 0
  ) {
    const monto = prompt('Ingrese el monto pagado:');
    if (!monto || parseFloat(monto) <= 0) {
      alert('Debe ingresar un monto válido');
      return;
    }
    body.montoPago = parseFloat(monto);
  }

  try {
    await api.patch(`/gasto-fijo-pago/${item.pago.id}`, body);
    // Refrescar datos
    await fetchPagosPorMes(infoInicialId);
  } catch (error) {
    console.error('Error al marcar como pagado:', error);
  }
};
```

---

## 5️⃣ Resumen de Endpoints

| Método | Ruta | Cambio |
|--------|------|--------|
| GET | `/gasto-fijo/search` | Respuesta con `activo`; query opcional `?activo=true/false` |
| GET | `/gasto-fijo/mis-gastos-fijos` | ❌ Ya NO devuelve `pagos`; ✅ ahora incluye `activo` |
| GET | `/gasto-fijo/:id` | Respuesta con `activo` |
| POST | `/gasto-fijo` | ❌ NO enviar `activo`; respuesta con `activo: true` |
| PATCH | `/gasto-fijo/:id` | ✅ Puede incluir `activo` en body (opcional) |
| GET | `/gasto-fijo-pago/por-info-inicial` | 🆕 **NUEVO**. Query `infoInicialId` (obligatorio) |
| PATCH | `/gasto-fijo-pago/:id` | Al marcar pagado, enviar `montoPago` si no hay monto fijo |

---

## 📋 Checklist de Implementación

### Tipos/Interfaces
- [ ] Agregar `activo: boolean` a todas las interfaces de `GastoFijo`
- [ ] Eliminar `pagos: GastoFijoPago[]` de `MisGastosFijosDTO`
- [ ] Crear interface `PagosGastoFijoDTO` para el nuevo endpoint
- [ ] Crear interface `PagoSimpleDTO` con `id?: number`

### Endpoints
- [ ] Actualizar llamadas a `GET /gasto-fijo/search` para manejar `activo`
- [ ] Actualizar llamadas a `GET /gasto-fijo/mis-gastos-fijos` (eliminar uso de `pagos`)
- [ ] Implementar llamada a `GET /gasto-fijo-pago/por-info-inicial`
- [ ] Actualizar `POST /gasto-fijo` para NO enviar `activo`
- [ ] Actualizar `PATCH /gasto-fijo/:id` para permitir enviar `activo`
- [ ] Actualizar `PATCH /gasto-fijo-pago/:id` con lógica de `montoPago`

### UI/UX
- [ ] Agregar columna/toggle de `activo` en listado de gastos fijos
- [ ] Agregar filtro por `activo` (opcional) en búsqueda
- [ ] Agregar checkbox/toggle de `activo` en formulario de edición
- [ ] Implementar pantalla "Gastos Fijos del Mes" usando nuevo endpoint
- [ ] Implementar lógica para pedir monto al marcar como pagado (si aplica)

---

## 🆘 Ejemplos de Código Completos

### Ejemplo: Obtener Pagos del Mes

```typescript
// api/gasto-fijo-pago.ts
export const getPagosPorInfoInicial = async (
  infoInicialId: number,
  token: string
): Promise<PagosGastoFijoDTO> => {
  const response = await fetch(
    `${API_BASE_URL}/gasto-fijo-pago/por-info-inicial?infoInicialId=${infoInicialId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al obtener pagos');
  }

  return response.json();
};
```

### Ejemplo: Actualizar Gasto Fijo (con activo)

```typescript
// api/gasto-fijo.ts
export const updateGastoFijo = async (
  id: number,
  data: {
    nombre?: string;
    montoFijo?: number;
    activo?: boolean;  // ⬅️ Ahora se puede enviar
    categoriaId?: number;
  },
  token: string
): Promise<GastoFijoDTO> => {
  const response = await fetch(`${API_BASE_URL}/gasto-fijo/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Error al actualizar gasto fijo');
  }

  return response.json();
};
```

### Ejemplo: Marcar Pago como Pagado

```typescript
// api/gasto-fijo-pago.ts
export const marcarPagoComoPagado = async (
  pagoId: number,
  montoPago?: number,  // Opcional: solo si no hay monto fijo
  token: string
): Promise<GastoFijoPagoDTO> => {
  const body: any = { pagado: true };
  
  if (montoPago !== undefined) {
    body.montoPago = montoPago;
  }

  const response = await fetch(`${API_BASE_URL}/gasto-fijo-pago/${pagoId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Error al marcar como pagado');
  }

  return response.json();
};
```

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo seguir usando `mis-gastos-fijos` para ver los pagos?**
R: No, ese endpoint ya no devuelve `pagos`. Usa `/gasto-fijo-pago/por-info-inicial` con el `infoInicialId` del mes.

**P: ¿Qué pasa si intento crear un gasto fijo con `activo: false`?**
R: El backend lo ignora y siempre crea con `activo: true`. Para desactivarlo, edítalo después con PATCH.

**P: ¿El campo `activo` afecta qué gastos aparecen en `/por-info-inicial`?**
R: Sí, solo aparecen los gastos fijos activos del usuario.

**P: ¿Qué hago si un pago no tiene `id`?**
R: Significa que aún no se creó el registro de pago para ese mes. Puedes crearlo con PATCH cuando el usuario marque como pagado o cambie el monto.

---

## 📞 Soporte

Si tienes dudas sobre la implementación, consulta:
- Documentación Swagger: `/api/docs` (cuando el servidor esté corriendo)
- Archivo de cambios técnicos: `docs/CAMBIOS-API-FRONTEND.md`

---

**Última actualización:** Febrero 2026

# Historial Financiero – Documentación completa

## 1. Estructura de las tablas

La base de datos vive enteramente en Google Sheets con las siguientes tres pestañas:

### 1.1 Movimientos
Registro histórico de ingresos y gastos. Tabla **independiente**: no tiene ninguna columna ni relación con `Deudas`.

| Columna        | Tipo de valor       | Detalles                                           |
|----------------|---------------------|----------------------------------------------------|
| id             | Texto (código)      | Único, generado por la app (`MOV-<timestamp>`).    |
| fecha          | Fecha               | Formato `YYYY-MM-DD`.                              |
| tipo           | Texto               | `Ingreso` o `Gasto`. Por defecto: `Ingreso`.       |
| categoria      | Texto               | Nombre de la categoría.                            |
| descripcion    | Texto libre         | Opcional. Detalle de la transacción.               |
| valor          | Número (positivo)   | Monto en COP. Obligatorio.                         |
| metodo_pago    | Texto               | `Transferencia`, `Tarjeta`, `Efectivo`, `Nequi`, `Daviplata`, `Otro`. Por defecto: `Efectivo`. |

---

### 1.2 Categorias
Catálogo para mantener la consistencia en los nombres. **Una sola columna**: no tiene `id`.

| Columna | Tipo de valor     | Detalles                                           |
|---------|-------------------|----------------------------------------------------|
| nombre  | Texto             | Nombre de la categoría (ej. Alimentación).         |

---

### 1.3 Deudas
Registro maestro de pasivos.

| Columna        | Tipo de valor     | Detalles                                                  |
|----------------|-------------------|-----------------------------------------------------------|
| id             | Texto (código)    | Único, generado por la app (`DEU-<timestamp>`).           |
| persona        | Texto             | Nombre de la persona o entidad a la que se le debe.       |
| categoria      | Texto             | Nombre de la categoría.                                   |
| total_deuda    | Número            | El capital inicial o total de la deuda.                   |
| abonado        | Número (manual)   | **Campo manual** (default 0): lo escribe la app.        |
| saldo          | Número (app)       | *Lo calcula la app*: `total_deuda` - `abonado`.          |
| estado         | Texto (app)        | *Lo calcula la app*: `Pagado` si saldo ≤ 0, si no `Pendiente`. |

> La hoja **no contiene fórmulas**: los datos empiezan en la fila 2 (la fila 1 es el encabezado) en `Movimientos` y `Deudas`, y la app escribe saldo/estado como valores planos.

---

## 2. Generación automática de IDs

- **Movimientos y Deudas:** La aplicación web está programada para generar automáticamente un ID único (como un UUID basado en el timestamp exacto) cada vez que guardas un registro nuevo. *Ejemplo:* `MOV-1790978115727` o `DEU-1790978125881`.
- **Saldo y estado (Deudas F-G):** El backend los calcula con `_saldoEstado(total_deuda, abonado)` y los escribe como valores en las columnas F y G. No hay ArrayFormulas ni columnas de solo lectura en el libro.

---

## 3. Estructura de filas: sin filas reservadas

### 3.1 Datos desde la fila 2

En las hojas `Movimientos` y `Deudas`, la fila 1 es el encabezado y **los datos empiezan en la fila 2**. No existe ninguna fila reservada, protegida u oculta, y la app no omite ninguna fila:

- `getMovimientos()`, `getDeudas()`, `_findRowById()` y `getDashboard()` leen **desde la fila 2**.
- Las filas vacías se excluyen solo con el filtro `id !== ""`.

### 3.2 Escritura en Deudas: A-G

El backend escribe las 7 columnas de `Deudas`:

- `saveDeuda()` escribe A-G (`id`, `persona`, `categoria`, `total_deuda`, `abonado`, `saldo`, `estado`); F y G llevan los valores calculados por `_saldoEstado()`.
- `abonado` es un **campo manual del formulario** (default `0`, no puede ser negativo ni superar `total_deuda`).
- `getDeudas()` lee A-E y vuelve a calcular saldo/estado en JS: la lectura tampoco depende de la hoja para esos dos campos.
- Validaciones de `saveDeuda()`: `abonado >= 0` y `abonado <= total_deuda`.

---

## 4. Relación Movimientos ↔ Deudas: ninguna (separación total)

Las hojas `Movimientos` y `Deudas` son **tablas completamente independientes**: cada una tiene su propio CRUD y la app no mantiene ninguna llave foránea entre ellas. La columna `deuda_id` **ya no existe** (se eliminó del código, del formulario y de la estructura documentada; si quedaba en la hoja, el usuario la borra):

| Concepto | Detalle |
|---|---|
| **Sin FK** | `Movimientos` no tiene `deuda_id`: registrar un gasto nunca vincula ni modifica una deuda. |
| **Abonos manuales** | Para reflejar un pago, se edita la deuda en la pestaña Deudas y se ajusta su campo `abonado` a mano; `saldo` y `estado` los recalcula la app al guardar. |
| **Ciclo de vida** | Borrar una deuda no deja huérfanos en Movimientos (no hay referencia cruzada), y borrar movimientos nunca toca una deuda. |
| **UI sin mezcla** | El formulario de Movimientos ya no muestra el selector "¿Abono a Deuda?" ni Visualizar muestra el badge "Deuda: X". |
| **IA sin mezcla** | El contexto de `preguntarAsesor` lista deudas y movimientos como dos bloques independientes (sin cruzar `deuda_id`). |
| **Gráfico por día** | `getMovimientos()` lee el nombre de categoría directo de la hoja; el Dashboard agrupa por `fecha` sin referencia a deudas. |

> **Regla de diseño**: nunca se cruzan tablas desde el código: `Deudas` es el maestro de pasivos (con abonado manual) y `Movimientos` el histórico de transacciones.

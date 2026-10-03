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
| abonado        | Número (manual)   | **Campo manual** (default 0): lo escribe la app en A-E.   |
| saldo          | Fórmula (Sheet)   | *No lo toca la App.* `total_deuda` - `abonado`.           |
| estado         | Fórmula (Sheet)   | *No lo toca la App.* `Pendiente` o `Pagado`.              |

---

## 2. Generación automática de IDs y Fórmulas

- **Movimientos y Deudas:** La aplicación web está programada para generar automáticamente un ID único (como un UUID basado en el timestamp exacto) cada vez que guardas un registro nuevo. *Ejemplo:* `MOV-1790978115727` o `DEU-1790978125881`.
- **Zonas Amarillas (Deudas F-G):** Las columnas de saldo y estado en la hoja `Deudas` se manejan 100% por fórmulas de Google Sheets (ArrayFormulas). Por diseño, el código del Backend **omite deliberadamente** escribir en estas columnas para evitar sobreescribir tus fórmulas (la columna E `abonado` sí la escribe la app: ver sección 3.2).

---

## 3. Filas reservadas (fila 2) y regla de solo lectura

### 3.1 Fila 2 en Movimientos y Deudas

En las hojas `Movimientos` y `Deudas`, la **fila 2 está reservada para las fórmulas** (ArrayFormulas que calculan saldo/estado y metadatos derivados). En el libro está **protegida y oculta**, y la aplicación la **omite en todo momento**:

- `getMovimientos()`, `getDeudas()` y `_findRowById()` leen **desde la fila 3**.
- `getDashboard()` también lee desde la fila 3: la fila 2 jamás suma en ingresos/gastos.
- Las filas que aparecen en la hoja sin `persona` o con `total_deuda <= 0` son restos de fórmulas (filas fantasma): `getDeudas()` las excluye para que no aparezcan en la tabla ni en el chat del asesor.

> Si mueves o desocultas la fila 2, las fórmulas del libro se rompen: la app asume que los datos siempre empiezan en la fila 3.

### 3.2 Escritura en Deudas: A-E sí, F-G no

El backend escribe A-E y **nunca** las columnas F (saldo) ni G (estado) de `Deudas`:

- `saveDeuda()` escribe únicamente A-E (`id`, `persona`, `categoria`, `total_deuda`, `abonado`).
- `abonado` es un **campo manual del formulario** (default `0`, no puede ser negativo ni superar `total_deuda`); saldo y estado los sigue calculando la fórmula de la hoja.
- Validaciones de `saveDeuda()`: `abonado >= 0` y `abonado <= total_deuda`.

---

## 4. Relación Movimientos ↔ Deudas: ninguna (separación total)

Las hojas `Movimientos` y `Deudas` son **tablas completamente independientes**: cada una tiene su propio CRUD y la app no mantiene ninguna llave foránea entre ellas. La columna `deuda_id` **ya no existe** (se eliminó del código, del formulario y de la estructura documentada; si quedaba en la hoja, el usuario la borra):

| Concepto | Detalle |
|---|---|
| **Sin FK** | `Movimientos` no tiene `deuda_id`: registrar un gasto nunca vincula ni modifica una deuda. |
| **Abonos manuales** | Para reflejar un pago, se edita la deuda en la pestaña Deudas y se ajusta su campo `abonado` a mano; `saldo` y `estado` se recalculan con las fórmulas de la hoja. |
| **Ciclo de vida** | Borrar una deuda no deja huérfanos en Movimientos (no hay referencia cruzada), y borrar movimientos nunca toca una deuda. |
| **UI sin mezcla** | El formulario de Movimientos ya no muestra el selector "¿Abono a Deuda?" ni Visualizar muestra el badge "Deuda: X". |
| **IA sin mezcla** | El contexto de `preguntarAsesor` lista deudas y movimientos como dos bloques independientes (sin cruzar `deuda_id`). |
| **Gráfico por día** | `getMovimientos()` lee el nombre de categoría directo de la hoja; el Dashboard agrupa por `fecha` sin referencia a deudas. |

> **Regla de diseño**: nunca se cruzan tablas desde el código: `Deudas` es el maestro de pasivos (con abonado manual) y `Movimientos` el histórico de transacciones.

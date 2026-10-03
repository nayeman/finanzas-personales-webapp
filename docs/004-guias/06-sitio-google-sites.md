# 06 — Contenedor limpio en Google Sites (sin banner de Google)

Al abrir la Web App directamente, Google muestra siempre el banner azul *"This application was created by a Google Apps Script user"* (solo se cierra con la X) y no se puede quitar por código. La solución es incrustar la app en un **Google Site con página completa**: dentro del iframe el banner no aparece, desaparecen las barras de navegación de Sites y la app ocupa el 100% de la pantalla.

**Requisitos previos**

- URL `/exec` de tu Web App publicada (ver [02 — Despliegue con clasp](./02-despliegue-clasp.md)).
- El repo ya habilita la incrustación: `doGet()` en `src/backend/main.js` llama `setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)`.
- La implementación debe tener acceso **Cualquiera** (anónimo): con "Cualquiera con cuenta de Google" el iframe no puede completar el login y muestra un error.

## Paso a paso

### 1. Iniciar el sitio

- **Acción**: entra a [Google Sites](https://sites.google.com/) y haz clic en **En blanco** (+).
- **Por qué**: crea un lienzo desde cero, sin plantillas que alteren tu diseño.

### 2. Crear la página especial de incrustación

- **Acción**: en el menú derecho **Páginas** → pasa el cursor sobre el botón **+** de abajo → selecciona el icono de código **Incrustar página completa (‹›)**. Nómbrala `Home` y pulsa **Hecho**.
- **Por qué**: elimina los encabezados y banners predeterminados de Google Sites y da una pantalla totalmente limpia.

### 3. Cambiar la página principal

- **Acción**: en la lista de páginas, haz clic en los tres puntos (**…**) junto a tu nueva página `Home` y selecciona **Establecer como página de inicio**.
- **Por qué**: el navegador abre tu Web App de inmediato cuando alguien escriba la URL de tu sitio.

### 4. Borrar la estructura vieja

- **Acción**: en la lista de páginas, ve a la página predeterminada **Inicio** (icono de casita), haz clic en sus tres puntos (**…**) y selecciona **Eliminar**.
- **Por qué**: el sitio queda con una sola página y sin menús de navegación que rompan la estética.

### 5. Ocultar el nombre en el menú

- **Acción**: en tu única página `Home`, haz clic en sus tres puntos (**…**) y selecciona **Ocultar de la barra de navegación**.
- **Por qué**: desvanece por completo la barra de texto superior; la app gana todo el espacio del monitor o del celular.

### 6. Incrustar tu Web App

- **Acción**: haz clic en el centro de la pantalla blanca en **Añadir elemento insertado** → pega tu URL de Apps Script terminada en `/exec` → **Insertar** → haz clic en **Publicar** (arriba a la derecha).
- **Por qué**: conecta el software al contenedor limpio y guarda los cambios en internet: sin banner de advertencia y sin barras.

## Verificación

1. Abre la URL pública del sitio en una ventana incógnito.
2. Comprueba que no esté el banner azul de Google y que no haya barra de navegación de Sites.
3. Si la app no carga (pantalla en blanco o error), revisa que la implementación sea **Cualquiera** y que el código tenga `ALLOWALL` en `src/backend/main.js`.

> **Nota**: si cambias la URL `/exec` de la app (nueva implementación), repite el paso 6 con la URL nueva. Si quitas `ALLOWALL`, Google vuelve a bloquear la incrustación con `X-Frame-Options`.

Volver al índice: [README de guías](./README.md).

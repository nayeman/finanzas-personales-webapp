# Estilo de JavaScript

Usamos estas prácticas como guía, no como reglas ciegas:

- Escribir identificadores en inglés con `camelCase` y nombres claros.
- Preferir `const`; usar `let` cuando el valor cambie.
- Mantener cada función enfocada y evitar duplicar lógica.
- Validar datos externos y no ocultar errores.
- Escribir comentarios breves en español para explicar propósito, uso o decisiones.

## Límites del proyecto

Apps Script comparte un ámbito global: no usar `import` ni `export`. `doGet` y las funciones llamadas desde la interfaz son contratos públicos. El texto visible y los encabezados de Google Sheets permanecen en español.

No se eliminan todos los `if` ni los bucles por principio. Se evitan la notación húngara y las optimizaciones prematuras; las recomendaciones antiguas se contrastan con MDN y el entorno actual.

## Referencias

- Clean Code JavaScript en español.
- W3C, JavaScript best practices.
- MDN, JavaScript code examples.

# 02 — Despliegue con clasp (ciclo diario y CI/CD)

Todos los comandos se ejecutan con `npx --yes @google/clasp ...` desde la raíz del repo: es la única forma de ejecutar herramientas en este proyecto.

## Ciclo de trabajo diario

```bash
# bajar cambios hechos en el editor web (si alguien tocó script.google.com)
npx --yes @google/clasp pull

# subir tu código local a Apps Script
npx --yes @google/clasp push

# ver el proyecto en el editor web
npx --yes @google/clasp open-script
```

Recomendación: una vez que exista CI/CD (abajo), el repositorio es la **única fuente de verdad**; evita editar a mano en script.google.com.

## Versiones e implementaciones

```bash
# crear una instantánea inmutable del proyecto
npx --yes @google/clasp version "descripcion de la version"

# listar versiones
npx --yes @google/clasp versions

# publicar (app web / complemento / ejecutable)
npx --yes @google/clasp deploy <version> <descripcion>

# listar implementaciones activas
npx --yes @google/clasp deployments

# actualizar una implementación existente con una versión nueva
npx --yes @google/clasp redeploy <deploymentId> <version> <descripcion>

# quitar una implementación
npx --yes @google/clasp undeploy <deploymentId>
```

## Credenciales (nunca en git)

| Archivo | Qué contiene | Dónde vive |
|---|---|---|
| `~/.clasprc.json` | token OAuth de tu cuenta | fuera del repo |
| `.clasp.json` | `scriptId` + `rootDir` del proyecto | en el repo, pero **gitignored** |

Ambos ya están en `.gitignore` (`node_modules/`, `.clasp.json`, `.clasprc.json`). Verificación rápida: `git status` nunca debe mostrarlos.

## CI/CD con GitHub Actions

Los runners de CI no pueden abrir el navegador para OAuth, así que las credenciales se guardan como **secretos del repositorio**:

| Secreto | Valor |
|---|---|
| `CLASPRC_JSON` | contenido completo de `~/.clasprc.json` |
| `CLASP_JSON` | contenido de `.clasp.json` del proyecto destino |

- **CI** (`.github/workflows/ci.yml`): en cada PR a `main` corre `npx --yes eslint src/`.
- **Deploy** (`.github/workflows/deploy.yml`): en cada push a `main` escribe los secretos como `~/.clasprc.json` y `.clasp.json`, y ejecuta:

```bash
npx --yes @google/clasp push --force
npx --yes @google/clasp version "$(git rev-parse --short HEAD)"
```

`--force` reemplaza el código remoto sin confirmación: por eso el repo debe ser la única fuente de verdad.

> **Nota:** `deploy.yml` no se incluye en este repo (es público y los secretos no deben existir ahí). El despliegue se hace en local con `npx --yes @google/clasp push`. Si quieres activarlo en tu copia privada, recrea el archivo con la tabla de secretos de arriba.

## Solución de problemas

| Error | Solución |
|---|---|
| `Script API not enabled` | Paso 0 de [01-entorno-npx](./01-entorno-npx.md): habilitar la API en script.google.com/home/usersettings |
| `401 Unauthorized` | `npx --yes @google/clasp login` de nuevo y actualizar el secreto `CLASPRC_JSON` |
| `ENOENT .clasp.json` | el paso de credenciales del workflow debe escribir el archivo antes del `push` |
| El push funciona pero el código no cambia | el `scriptId` del secreto no coincide con el proyecto destino |

Siguiente: [03 — Autocompletado y LSP](./03-autocompletado-lsp.md).

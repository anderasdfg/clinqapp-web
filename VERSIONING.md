# Sistema de Versionado y Cache Busting

## Descripción General

Este proyecto implementa un sistema robusto de versionado y cache busting para asegurar que los usuarios finales siempre vean la versión más reciente de la aplicación después de cada despliegue.

## Componentes del Sistema

### Frontend

#### 1. Versionado Automático
- La versión se define en `frontend/package.json`
- Vite inyecta automáticamente la versión en tiempo de compilación mediante la variable global `__APP_VERSION__`
- La versión se muestra en el footer del dashboard para soporte técnico

#### 2. Cache Busting
- **Archivos JS/CSS**: Vite genera nombres de archivo con hash único (ej: `main.a1b2c3d4.js`)
- **HTML**: Meta tags en `index.html` previenen el cacheo del HTML principal
- **Configuración Vite**: 
  - `entryFileNames`: Hash en archivos de entrada
  - `chunkFileNames`: Hash en chunks de código
  - `assetFileNames`: Hash en assets (CSS, imágenes, etc.)

#### 3. Meta Tags de Cache Control
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### Backend

#### Cache Control Headers
El backend envía headers HTTP para prevenir cacheo de respuestas API:
- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `Surrogate-Control: no-store`

## Cómo Actualizar la Versión

### Para Nuevos Despliegues

1. **Actualizar versión en frontend**:
   ```bash
   cd frontend
   npm version patch  # Para cambios menores (1.0.0 -> 1.0.1)
   npm version minor  # Para nuevas características (1.0.0 -> 1.1.0)
   npm version major  # Para cambios importantes (1.0.0 -> 2.0.0)
   ```

2. **Compilar y desplegar**:
   ```bash
   npm run build
   # Desplegar según tu proceso de deployment
   ```

### Verificación de Versión para Soporte

Los usuarios pueden ver la versión actual en el **footer del dashboard**:
- Ubicación: Parte inferior de cualquier página del dashboard
- Formato: `Versión: X.Y.Z`

Esto permite al equipo de soporte:
- Verificar si un usuario tiene la versión más reciente
- Identificar si necesitan limpiar cache manualmente
- Hacer seguimiento de qué versión tiene cada usuario

## Flujo de Actualización

### Escenario Normal (Automático)
1. Se despliega nueva versión (ej: 1.0.1)
2. Usuario recarga la página
3. El navegador detecta nuevo HTML (no cacheado)
4. Descarga nuevos archivos JS/CSS con hash diferente
5. Usuario ve la nueva versión automáticamente

### Escenario de Cache Persistente (Manual)
Si un usuario reporta no ver cambios:

1. **Verificar versión**: Pedir al usuario que revise el footer
2. **Si la versión es antigua**:
   - Pedir hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
   - Si persiste: Limpiar cache del navegador
   - Último recurso: Modo incógnito para verificar

## Mejores Prácticas

### Para Desarrollo
- Incrementar versión en cada PR importante
- Usar semantic versioning (MAJOR.MINOR.PATCH)
- Documentar cambios en CHANGELOG

### Para Despliegues
- Siempre actualizar versión antes de desplegar a producción
- Verificar que el build genera archivos con hash
- Confirmar que el footer muestra la versión correcta

### Para Soporte
- Siempre preguntar la versión al usuario (visible en footer)
- Comparar con versión en producción
- Si difieren, guiar al usuario a hacer hard refresh

## Archivos Clave

- `frontend/package.json` - Define la versión
- `frontend/vite.config.ts` - Configuración de cache busting
- `frontend/index.html` - Meta tags de cache control
- `frontend/src/components/dashboard/DashboardFooter.tsx` - Muestra la versión
- `backend/src/index.ts` - Headers de cache control para API

## Troubleshooting

### La versión no se actualiza en el footer
- Verificar que `__APP_VERSION__` esté definido en `vite-env.d.ts`
- Confirmar que el build se ejecutó correctamente
- Revisar que no haya errores en la consola del navegador

### Usuarios ven versión antigua después de despliegue
- Verificar que los archivos en producción tengan hash nuevo
- Confirmar que el HTML no está siendo cacheado por CDN/proxy
- Revisar headers de cache en Network tab del navegador

### Build falla después de cambios
- Verificar sintaxis en `vite.config.ts`
- Confirmar que todas las dependencias están instaladas
- Revisar logs de compilación para errores específicos

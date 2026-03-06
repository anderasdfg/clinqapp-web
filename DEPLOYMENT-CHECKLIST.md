# Checklist de Deployment con Versionado

## Pre-Deployment

- [ ] Todos los cambios están commiteados
- [ ] Tests pasan correctamente
- [ ] Build local funciona sin errores

## Actualización de Versión

- [ ] Ejecutar script de versión: `./update-version.sh [patch|minor|major]`
- [ ] Verificar nueva versión en `frontend/package.json`
- [ ] Commit de cambio de versión: `git commit -m "chore: bump version to X.Y.Z"`

## Build y Verificación

- [ ] Compilar frontend: `cd frontend && npm run build`
- [ ] Verificar archivos con hash en `frontend/dist/assets/`
- [ ] Confirmar que no hay errores de compilación

## Deployment

- [ ] Push a repositorio: `git push origin main`
- [ ] Esperar deployment automático (Vercel/Netlify)
- [ ] O ejecutar deployment manual según proceso

## Post-Deployment

- [ ] Abrir aplicación en producción
- [ ] Login y navegar al dashboard
- [ ] **Verificar versión en footer** (debe mostrar nueva versión)
- [ ] Abrir DevTools > Network
- [ ] Hacer hard refresh (`Cmd + Shift + R`)
- [ ] Confirmar que archivos JS/CSS tienen hash nuevo
- [ ] Verificar que no hay errores en consola

## Comunicación a Soporte

- [ ] Notificar nueva versión al equipo de soporte
- [ ] Compartir número de versión (ej: 1.0.1)
- [ ] Recordar que la versión es visible en footer del dashboard

## Si Usuarios Reportan Problemas

1. **Preguntar versión**: Pedir que revisen el footer del dashboard
2. **Si versión es antigua**:
   - Pedir hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
   - Si persiste: Limpiar cache del navegador
   - Último recurso: Modo incógnito para verificar
3. **Si versión es correcta pero hay problemas**: Investigar bug específico

## Notas Importantes

- ✅ **Cache Busting Automático**: Los archivos tienen hash único
- ✅ **HTML sin Cache**: Meta tags previenen cacheo del HTML
- ✅ **API sin Cache**: Backend envía headers apropiados
- ✅ **Versión Visible**: Footer muestra versión para soporte
- ✅ **Semantic Versioning**: MAJOR.MINOR.PATCH

## Comandos Rápidos

```bash
# Actualizar versión patch (1.0.0 -> 1.0.1)
./update-version.sh patch

# Actualizar versión minor (1.0.0 -> 1.1.0)
./update-version.sh minor

# Actualizar versión major (1.0.0 -> 2.0.0)
./update-version.sh major

# Ver versión actual
cat frontend/package.json | grep version

# Build frontend
cd frontend && npm run build

# Ver archivos generados
ls -la frontend/dist/assets/
```

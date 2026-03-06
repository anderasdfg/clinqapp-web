---
description: Desplegar a producción con actualización de versión
---

# Workflow: Desplegar con Actualización de Versión

Este workflow te guía para desplegar una nueva versión a producción con el sistema de cache busting.

## Pasos

### 1. Actualizar la versión

Ejecuta el script de actualización de versión según el tipo de cambio:

```bash
# Para bug fixes y cambios menores (1.0.0 -> 1.0.1)
./update-version.sh patch

# Para nuevas características (1.0.0 -> 1.1.0)
./update-version.sh minor

# Para cambios importantes/breaking changes (1.0.0 -> 2.0.0)
./update-version.sh major
```

### 2. Verificar cambios

Revisa que la versión se actualizó correctamente:

```bash
cat frontend/package.json | grep version
```

### 3. Hacer commit

```bash
git add frontend/package.json
git commit -m "chore: bump version to X.Y.Z"
```

### 4. Compilar frontend

```bash
cd frontend
npm run build
```

### 5. Verificar build

Confirma que los archivos tienen hash único:

```bash
ls -la frontend/dist/assets/
```

Deberías ver archivos como: `index.a1b2c3d4.js`, `index.e5f6g7h8.css`

### 6. Desplegar

Sigue tu proceso normal de deployment (Vercel, Netlify, etc.)

### 7. Verificar en producción

1. Abre la aplicación en producción
2. Navega al dashboard
3. Verifica que el footer muestre la nueva versión
4. Abre DevTools > Network y confirma que los archivos tienen hash nuevo

## Notas

- **Cache Busting Automático**: Los archivos JS/CSS tendrán hash único, forzando descarga
- **HTML sin Cache**: El index.html tiene meta tags que previenen cacheo
- **API sin Cache**: El backend envía headers para prevenir cacheo de respuestas
- **Versión Visible**: Los usuarios y soporte pueden ver la versión en el footer

## Troubleshooting

Si los usuarios no ven la nueva versión:

1. Verificar que el footer muestre la versión correcta
2. Pedir hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
3. Si persiste: Limpiar cache del navegador
4. Verificar en modo incógnito para confirmar que el problema es de cache local

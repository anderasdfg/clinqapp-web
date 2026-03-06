#!/bin/bash

# Script para actualizar la versión de ClinqApp
# Uso: ./update-version.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

echo "🔄 Actualizando versión de ClinqApp..."
echo "📦 Tipo de actualización: $VERSION_TYPE"
echo ""

# Navegar a frontend
cd frontend

# Actualizar versión
echo "📝 Actualizando package.json..."
npm version $VERSION_TYPE --no-git-tag-version

# Obtener nueva versión
NEW_VERSION=$(node -p "require('./package.json').version")

echo ""
echo "✅ Versión actualizada a: $NEW_VERSION"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Revisar los cambios en package.json"
echo "   2. Hacer commit: git add . && git commit -m 'chore: bump version to $NEW_VERSION'"
echo "   3. Compilar: npm run build"
echo "   4. Desplegar a producción"
echo ""
echo "💡 Los usuarios verán la versión $NEW_VERSION en el footer del dashboard"

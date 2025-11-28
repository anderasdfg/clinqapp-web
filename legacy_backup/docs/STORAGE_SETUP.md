# Configuración de Supabase Storage

## Buckets Creados

Los siguientes buckets ya fueron creados automáticamente:

1. **organizations** (público) - Para logos y archivos de organizaciones
2. **patients** (privado) - Para imágenes de tratamientos de pacientes

## Configurar Políticas de Acceso (RLS Policies)

Las políticas de acceso deben configurarse manualmente en el Dashboard de Supabase.

### Paso 1: Acceder a Storage

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Storage** en el menú lateral
4. Haz clic en el bucket **organizations**

### Paso 2: Crear Políticas para el bucket "organizations"

Haz clic en **Policies** y crea las siguientes políticas:

#### Política 1: Permitir subir archivos (INSERT)
```sql
-- Nombre: Allow authenticated users to upload
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'organizations');
```

#### Política 2: Permitir lectura pública (SELECT)
```sql
-- Nombre: Allow public read access
-- Operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'organizations');
```

#### Política 3: Permitir actualizar archivos (UPDATE)
```sql
-- Nombre: Allow authenticated users to update
-- Operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'organizations');
```

#### Política 4: Permitir eliminar archivos (DELETE)
```sql
-- Nombre: Allow authenticated users to delete
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'organizations');
```

### Paso 3: Crear Políticas para el bucket "patients"

Repite el proceso para el bucket **patients**, pero **sin** la política de lectura pública:

#### Política 1: Permitir subir archivos (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload patient files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patients');
```

#### Política 2: Permitir lectura solo a usuarios autenticados (SELECT)
```sql
CREATE POLICY "Allow authenticated users to read patient files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'patients');
```

#### Política 3: Permitir actualizar archivos (UPDATE)
```sql
CREATE POLICY "Allow authenticated users to update patient files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patients');
```

#### Política 4: Permitir eliminar archivos (DELETE)
```sql
CREATE POLICY "Allow authenticated users to delete patient files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patients');
```

## Alternativa: Usar el Editor de Políticas Visual

Si prefieres usar la interfaz visual:

1. Ve a Storage → [nombre del bucket] → Policies
2. Haz clic en **New Policy**
3. Selecciona el tipo de operación (INSERT, SELECT, UPDATE, DELETE)
4. Elige **Authenticated** o **Public** según corresponda
5. Guarda la política

## Verificar Configuración

Para verificar que todo funciona:

1. Inicia sesión en la aplicación
2. Ve al onboarding
3. Intenta subir un logo en el Step 1
4. Si todo está bien, verás: "Logo subido exitosamente"
5. La URL se guardará automáticamente y la imagen será accesible públicamente

## Troubleshooting

### Error: "new row violates row-level security policy"
- **Causa**: Faltan las políticas de INSERT
- **Solución**: Crea la política de INSERT para authenticated users

### Error: "Unable to read file"
- **Causa**: El bucket no es público o falta la política de SELECT
- **Solución**: Asegúrate de que el bucket "organizations" es público y tiene la política SELECT para public

### La imagen no se muestra
- **Causa**: La URL no es accesible públicamente
- **Solución**: Verifica que el bucket sea público en Settings → Make bucket public

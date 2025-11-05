# Configuración de Autenticación ClinqApp

Este documento proporciona instrucciones paso a paso para configurar el sistema de autenticación de ClinqApp con Supabase.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración de Supabase](#configuración-de-supabase)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Configuración de Correo Electrónico](#configuración-de-correo-electrónico)
- [Pruebas](#pruebas)
- [Solución de Problemas](#solución-de-problemas)

## ✅ Requisitos Previos

- Cuenta de Supabase (gratuita)
- Node.js 18+ instalado
- Proyecto ClinqApp clonado localmente

## 🔧 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Clic en "New Project"
4. Completa los datos:
   - **Name**: ClinqApp
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a tus usuarios (South America para Perú)
5. Espera a que el proyecto se cree (2-3 minutos)

### 2. Obtener Credenciales

1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key

## 🔑 Configuración de Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Database (ya deberías tenerlo)
DATABASE_URL=tu_database_url_de_supabase
```

2. Para obtener el `DATABASE_URL`:
   - Ve a **Settings** → **Database** en Supabase
   - Copia la **Connection String** en modo "URI"
   - Reemplaza `[YOUR-PASSWORD]` con la contraseña de la base de datos

## 🗄️ Configuración de la Base de Datos

### 1. Ejecutar Migraciones de Prisma

```bash
# Genera el cliente de Prisma
npm run db:push

# Opcional: Seed inicial
npm run db:seed
```

### 2. Configurar Triggers de Autenticación

1. Ve a **SQL Editor** en Supabase
2. Crea un nuevo query
3. Copia y pega el contenido del archivo `/supabase/auth-setup.sql`
4. Ejecuta el script (clic en "RUN")

Este script configura:
- ✅ Trigger para crear perfil de usuario automáticamente al registrarse
- ✅ Trigger para actualizar `email_verified` cuando se confirma el email
- ✅ Políticas de Row Level Security (RLS)
- ✅ Creación automática de organización para nuevos usuarios

### 3. Verificar Triggers

En el SQL Editor, ejecuta:

```sql
-- Ver triggers creados
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified');
```

Deberías ver 2 triggers.

## 📧 Configuración de Correo Electrónico

### Opción 1: Usar Email de Desarrollo de Supabase (Recomendado para testing)

Supabase proporciona un servicio de email gratuito para desarrollo:

1. Ve a **Authentication** → **Email Templates**
2. Personaliza las plantillas si lo deseas
3. ¡Listo! Ya puedes enviar emails de verificación

**⚠️ Limitación**: Los emails pueden ir a spam y tienen límite de envíos.

### Opción 2: Configurar SMTP Personalizado (Recomendado para producción)

1. Ve a **Settings** → **Auth** → **SMTP Settings**
2. Activa "Enable Custom SMTP"
3. Configura con tu proveedor de email:

#### Ejemplo con Gmail:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: tu-email@gmail.com
SMTP Password: [App Password - NO tu contraseña normal]
Sender Email: tu-email@gmail.com
Sender Name: ClinqApp
```

**Nota**: Para Gmail necesitas crear una [App Password](https://support.google.com/accounts/answer/185833)

#### Otros proveedores recomendados:

- **SendGrid** (12,000 emails gratis/mes)
- **Mailgun** (5,000 emails gratis/mes)
- **Resend** (3,000 emails gratis/mes)

### Personalizar URLs de Redirección

1. Ve a **Authentication** → **URL Configuration**
2. Configura:
   - **Site URL**:
     - Desarrollo: `http://localhost:3000`
     - Producción: `https://tu-dominio.com`
   - **Redirect URLs**: Agrega:
     - `http://localhost:3000/auth/callback`
     - `https://tu-dominio.com/auth/callback` (para producción)

## 🧪 Pruebas

### 1. Probar Registro

```bash
# Inicia el servidor de desarrollo
npm run dev
```

1. Ve a `http://localhost:3000/register`
2. Completa el formulario con:
   - Email real (para recibir el correo)
   - Contraseña de mínimo 8 caracteres
   - Nombre completo
   - DNI de 8 dígitos
3. Haz clic en "Crear Cuenta"

### 2. Verificar Email

1. Revisa tu bandeja de entrada (y spam)
2. Haz clic en el enlace de verificación
3. Deberías ser redirigido a `/dashboard`

### 3. Verificar Base de Datos

En Supabase SQL Editor:

```sql
-- Ver usuarios creados
SELECT * FROM public.users;

-- Ver organizaciones creadas
SELECT * FROM public.organizations;

-- Ver usuarios de auth
SELECT id, email, email_confirmed_at FROM auth.users;
```

### 4. Probar Login

1. Ve a `http://localhost:3000/login`
2. Ingresa tu email y contraseña
3. Deberías ser redirigido a `/dashboard`

## 🐛 Solución de Problemas

### Error: "Email not confirmed"

**Causa**: El usuario no ha verificado su email.

**Solución**:
1. Revisa el email (incluyendo spam)
2. O ve a `http://localhost:3000/auth/verify-email?email=tu@email.com` y reenvía el correo

### Error: "Este correo electrónico ya está registrado"

**Causa**: El email ya existe en la base de datos.

**Solución**:
- Usa otro email, o
- Inicia sesión con ese email, o
- Elimina el usuario desde Supabase → Authentication → Users

### Error: "Este DNI ya está registrado"

**Causa**: El DNI ya existe en la base de datos.

**Solución**:
- Verifica que el DNI sea correcto
- Elimina el registro duplicado desde Supabase → Table Editor → users

### Los triggers no se ejecutan

**Causa**: Posible error en el SQL o permisos.

**Solución**:
1. Verifica que los triggers existan (ver paso 3 de "Configuración de la Base de Datos")
2. Revisa los logs en Supabase → Database → Logs
3. Re-ejecuta el script `/supabase/auth-setup.sql`

### Error: "Failed to fetch"

**Causa**: Variables de entorno incorrectas o no cargadas.

**Solución**:
1. Verifica que `.env.local` exista
2. Reinicia el servidor de desarrollo: `Ctrl+C` y `npm run dev`
3. Verifica que las URLs de Supabase sean correctas

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## 🔐 Seguridad

### Mejores Prácticas

1. ✅ **NUNCA** subas el archivo `.env.local` a Git
2. ✅ Usa contraseñas seguras para la base de datos
3. ✅ Habilita MFA en tu cuenta de Supabase
4. ✅ Revisa los logs regularmente
5. ✅ Mantén actualizado Supabase y las dependencias

### RLS (Row Level Security)

El sistema ya tiene RLS habilitado. Esto significa:
- Los usuarios solo pueden ver sus propios datos
- Los usuarios solo pueden modificar datos de su organización
- Los datos están protegidos a nivel de base de datos

## 🎉 ¡Listo!

Tu sistema de autenticación está configurado y listo para usar. Los usuarios ahora pueden:

- ✅ Registrarse con email, contraseña, nombre completo y DNI
- ✅ Recibir email de verificación
- ✅ Verificar su email
- ✅ Iniciar sesión
- ✅ Ver mensajes de error claros si el email o DNI ya existen
- ✅ Reenviar el email de verificación si no lo reciben
- ✅ Tener su propia organización creada automáticamente

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

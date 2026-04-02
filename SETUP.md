# Cocina Oculta — Guía de Setup

## 1. Configurar Supabase

### 1a. Obtener las keys
1. Ir a https://supabase.com/dashboard/project/arhajivdxgijkqqlxwzo/settings/api
2. Copiar **anon public** key y **service_role** key

### 1b. Actualizar .env.local
Abrir el archivo `.env.local` en la carpeta del proyecto y reemplazar:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI   ← pegar la anon key
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI ← pegar la service_role key
```

### 1c. Ejecutar el schema SQL
1. Ir a https://supabase.com/dashboard/project/arhajivdxgijkqqlxwzo/sql/new
2. Copiar el contenido completo del archivo `supabase-schema.sql`
3. Pegarlo en el editor SQL y hacer click en "Run"
   - Esto crea las tablas, carga los productos iniciales y configura los permisos

### 1d. Crear usuario admin
1. Ir a https://supabase.com/dashboard/project/arhajivdxgijkqqlxwzo/auth/users
2. Click en "Add user" → "Create new user"
3. Email: francomoschettoni@gmail.com
4. Elegir una contraseña segura
5. Con esas credenciales podés entrar a /admin

## 2. Configurar MercadoPago (cuando tengas las keys)

1. Ir a https://www.mercadopago.com.ar/developers/panel
2. Crear una aplicación
3. Copiar Public Key y Access Token
4. En `.env.local` reemplazar:
```
NEXT_PUBLIC_MP_PUBLIC_KEY=tu_public_key
MP_ACCESS_TOKEN=tu_access_token
```

## 3. Correr el proyecto localmente

```bash
npm run dev
```
→ Abrir http://localhost:3000

## 4. Subir imágenes de productos

Desde el panel admin (/admin/productos):
- Click en "Nuevo producto" o en el ícono de editar
- Hacer click en el área de imagen para subir una foto
- Las imágenes se suben automáticamente a Supabase Storage

## 5. Rutas del sitio

| URL | Descripción |
|-----|-------------|
| / | Página de inicio |
| /tienda | Catálogo completo |
| /checkout | Finalizar pedido |
| /admin | Login admin |
| /admin/dashboard | Estadísticas |
| /admin/productos | Gestión de productos |
| /admin/pedidos | Gestión de pedidos |

## 6. Deploy en Netlify (cuando estés listo)

1. Subir el proyecto a GitHub
2. Conectar el repo en Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Agregar las variables de entorno en Netlify


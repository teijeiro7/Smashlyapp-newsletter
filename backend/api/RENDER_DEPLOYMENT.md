# Desplegar Backend en Render - Guía Paso a Paso

## Paso 1: Preparar tu cuenta de Render

1. Ve a [render.com](https://render.com)
2. Haz clic en "Get Started for Free"
3. Regístrate con tu cuenta de GitHub (recomendado) o email
4. **No necesitas tarjeta de crédito** ✅

## Paso 2: Conectar tu repositorio

1. En el dashboard de Render, haz clic en **"New +"** (arriba a la derecha)
2. Selecciona **"Web Service"**
3. Conecta tu cuenta de GitHub si aún no lo has hecho
4. Busca y selecciona el repositorio: `Smashlyapp-newsletter`
5. Haz clic en **"Connect"**

## Paso 3: Configurar el servicio

En la página de configuración, completa lo siguiente:

### Configuración Básica:
- **Name**: `smashly-api` (o el nombre que prefieras)
- **Region**: Selecciona el más cercano a ti:
  - `Frankfurt` (Europa)
  - `Oregon` (USA West)
  - `Ohio` (USA East)
  - `Singapore` (Asia)
- **Branch**: `main`
- **Root Directory**: `backend/api` ⚠️ **MUY IMPORTANTE**
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Plan:
- Selecciona **"Free"** (0$/mes)
- ⚠️ Nota: El servicio se dormirá después de 15 minutos de inactividad

## Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes variables:

### Variables Requeridas:

```
NODE_ENV = production
PORT = 10000
SUPABASE_URL = tu_supabase_url_aquí
SUPABASE_ANON_KEY = tu_supabase_anon_key_aquí
```

O si usas Service Role Key:
```
SUPABASE_SERVICE_ROLE_KEY = tu_supabase_service_role_key_aquí
```

### Variables Opcionales:

```
FRONTEND_URL = https://tu-frontend.vercel.app
JWT_SECRET = tu_jwt_secret_aquí
GEMINI_API_KEY = tu_gemini_api_key_aquí
```

**⚠️ IMPORTANTE sobre FRONTEND_URL:**
- Si desplegas tu frontend en Vercel, la URL será algo como: `https://smashlyapp-newsletter.vercel.app`
- Puedes agregar múltiples URLs separadas por comas: `https://app1.vercel.app,https://app2.vercel.app`
- Si no configuras esta variable, el backend aceptará peticiones de cualquier origen

## Paso 5: Crear el servicio

1. Revisa que todo esté correcto
2. Haz clic en **"Create Web Service"**
3. Render comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias
   - Compilar TypeScript
   - Iniciar tu servidor

Este proceso puede tardar **3-5 minutos** la primera vez.

## Paso 6: Verificar el despliegue

Una vez que el despliegue termine (verás "Live" en verde):

1. Copia la URL de tu servicio (será algo como: `https://smashly-api.onrender.com`)
2. Prueba el health check en tu navegador:
   ```
   https://smashly-api.onrender.com/api/v1/health
   ```
3. Deberías ver una respuesta JSON como:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-27T...",
     "uptime": 123
   }
   ```

## Paso 7: Conectar con tu Frontend

1. Ve a tu proyecto de frontend en Vercel
2. Agrega una variable de entorno:
   ```
   VITE_API_URL = https://smashly-api.onrender.com
   ```
3. Redeploy tu frontend

4. Ve a tu proyecto de backend en Render
5. Agrega tu URL de frontend a la variable `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://tu-frontend.vercel.app
   ```
6. Render hará redeploy automáticamente

## Características del Plan Gratuito

### ✅ Incluye:
- 750 horas/mes (suficiente para 1 servicio 24/7)
- SSL/HTTPS gratuito automático
- Auto-deploys desde GitHub
- Logs en tiempo real
- Variables de entorno
- Health checks automáticos

### ⚠️ Limitaciones:
- El servicio se "duerme" después de 15 minutos sin tráfico
- Primera petición después de dormir tarda ~30-60 segundos
- 512 MB de RAM
- CPU compartida

## Soluciones a Problemas Comunes

### 1. El build falla con "Cannot find module"
- Asegúrate de que el `Root Directory` esté configurado como `backend/api`
- Verifica que todas las dependencias estén en `package.json`

### 2. CORS errors
- Verifica que la variable `FRONTEND_URL` esté configurada correctamente
- Asegúrate de incluir el protocolo (`https://`)
- Revisa los logs para ver qué origen está siendo bloqueado

### 3. El servicio se reinicia constantemente
- Revisa los logs en Render
- Verifica que todas las variables de entorno requeridas estén configuradas
- Asegúrate de que `SUPABASE_URL` esté presente

### 4. "Service Unavailable" después de 15 minutos
- Es normal, el servicio está dormido
- La primera petición lo despertará (tarda ~30-60 segundos)
- Puedes usar un servicio como [UptimeRobot](https://uptimerobot.com) para hacer ping cada 5 minutos y mantenerlo despierto

## Logs y Monitoreo

Para ver los logs:
1. Ve a tu servicio en Render
2. Haz clic en la pestaña **"Logs"**
3. Verás todos los logs de tu aplicación en tiempo real

Para ver métricas:
1. Haz clic en la pestaña **"Metrics"**
2. Verás CPU, memoria, y peticiones HTTP

## Auto-Deploy desde GitHub

Render se redesplegará automáticamente cuando:
- Hagas push a la rama `main`
- Cambies variables de entorno
- Hagas clic en "Manual Deploy"

## URLs Importantes

- **Dashboard**: https://dashboard.render.com
- **Documentación**: https://render.com/docs
- **Status**: https://status.render.com

## Siguiente Paso

Una vez desplegado, actualiza la documentación de tu frontend para usar la nueva URL de la API.

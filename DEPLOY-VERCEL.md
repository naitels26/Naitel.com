# Publicar el chatbot en Vercel

El proyecto usa HTML/JavaScript estáticos y funciones Node independientes en
`api/chat.js` y `api/status.js`. No se debe ejecutar `node server.cjs` como build:
ese servidor es para desarrollo local.

1. Sube los cambios a la rama conectada a Vercel, incluidos `server-data/`,
   `api/`, `tools/build-vercel.cjs` y `vercel.json`.
2. En Vercel, selecciona el directorio raíz de este repositorio y el preset
   **Other**. Deja que `vercel.json` defina el build y la salida `dist`.
   Elimina overrides anteriores de Build Command u Output Directory.
3. En Settings → Environment Variables, configura `GEMINI_API_KEY` para
   Production y, si lo necesitas, Preview. `GEMINI_MODEL` es opcional; usa un
   modelo de texto habilitado para tu clave. Sin esa variable se descubre un
   modelo Flash mediante la API de Gemini.
4. Ejecuta Redeploy del commit que contiene estas rutas.
5. Abre `/api/status`: debe responder JSON con `chatConfigured: true`.
   Esto confirma que existe la variable, no que Gemini haya aceptado la clave.
   Después envía una consulta sobre servicios al chatbot.

La clave nunca va en GitHub, en el navegador ni en `dist`. El catálogo de
`server-data/` se genera exclusivamente a partir de los servicios públicos en
`content.js` y `service-map.js`. Se incluye en la función y se excluye de la salida
estática mediante el build por lista permitida. El catálogo privado completo
permanece local y no se sube: en Vercel el asistente usa los resúmenes públicos,
por lo que sus respuestas tienen menos detalle técnico. `private/` sigue excluido.

El formulario `/api/contact` del servidor local requiere almacenamiento
persistente y correo Microsoft 365. Este cambio publica las rutas del chatbot;
no migra ese formulario a Vercel ni sus archivos de solicitudes.

Comprobaciones locales:

```powershell
node --test api.test.cjs chat-policy.test.cjs gemini-request.test.cjs contact-mail.test.cjs vercel-api.test.cjs
node tools/build-vercel.cjs
```

Referencias: https://vercel.com/docs/functions/runtimes/node-js y
https://vercel.com/docs/environment-variables/managing-environment-variables

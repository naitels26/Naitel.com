# Activar correo del formulario con Microsoft 365

Destinatario fijo: **aleon@naitel.com**. Por defecto también se usa ese buzón para enviar. Al responder al correo recibido, la respuesta se dirige al visitante que llenó el formulario.

## Configuración en Microsoft

1. Inicia sesión con una cuenta administradora de tu organización en https://entra.microsoft.com/.
2. Ve a **Identidad → Aplicaciones → Registros de aplicaciones → Nuevo registro**. Nombre sugerido: `NAITEL formulario web`. Selecciona cuentas de este directorio organizativo. No requiere URI de redirección. Registra la aplicación.
3. En **Información general**, copia **Id. de directorio (inquilino)** a `M365_TENANT_ID` y **Id. de aplicación (cliente)** a `M365_CLIENT_ID`.
4. En **Permisos de API → Agregar un permiso → Microsoft Graph → Permisos de aplicación**, agrega **Mail.Send**. Un administrador debe conceder consentimiento para la organización. Este permiso permite enviar correo como aplicación; limita su acceso al buzón remitente mediante las políticas de acceso de Exchange de tu organización.
5. En **Certificados y secretos → Secretos de cliente → Nuevo secreto de cliente**, crea el secreto y copia su **Valor** (no el identificador) a `M365_CLIENT_SECRET`. Guárdalo en el servidor y registra su fecha de vencimiento para renovarlo. No lo compartas por chat ni lo agregues al código público.

Si no aparecen esas opciones o no puedes otorgar consentimiento, solicita estos pasos al administrador de Microsoft 365.

## Configuración local

En `C:\Naitel.com\Naitel.com\.env` ya están preparados estos campos:

```dotenv
M365_TENANT_ID=
M365_CLIENT_ID=
M365_CLIENT_SECRET=
M365_SENDER=aleon@naitel.com
```

Completa los tres valores vacíos y reinicia `node server.cjs` desde la carpeta del proyecto. El remitente debe tener un buzón de Exchange Online accesible para la aplicación. Conserva las variables existentes de Gemini.

## Prueba final

1. Abre el formulario Contáctanos, envía una solicitud de prueba con tus propios datos y comprueba el folio.
2. Revisa la bandeja de entrada y correo no deseado de **aleon@naitel.com**, y Elementos enviados del remitente.
3. Comprueba que **Responder** utiliza el correo ingresado por el visitante.

El formulario guarda siempre primero la solicitud en `private/requests/<folio>.json`. Registra `emailStatus`: `accepted` si Microsoft aceptó el envío, `not_configured` si faltan credenciales, `failed` si el envío falló o `pending` si se interrumpió el proceso. La aceptación de Microsoft no confirma la entrega al buzón. No hay reenvío automático: revisa las solicitudes pendientes o fallidas antes de reenviarlas para evitar duplicados.

`GET /api/status` muestra `contactEmailConfigured` sin exponer credenciales; únicamente indica que los valores están completos, no que Microsoft los haya validado.

Documentación oficial: [Enviar correo con Graph](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0), [autenticación de aplicaciones](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow), [permisos y restricción a buzones](https://learn.microsoft.com/en-us/graph/permissions-reference#mail-send).

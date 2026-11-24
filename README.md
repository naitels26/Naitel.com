# NAITEL — Prototipo actualizado

## Menú Soluciones con ocho estaciones (24/11/2026)

El menú Solutions/Soluciones muestra únicamente las ocho estaciones del modelo 3D, en el mismo orden del recorrido: CCTV y accesos, Desarrollo de software, Racks y pasillos, Switches y routers, Climatización de precisión, Energía crítica, Supresión con agente limpio y Cableado y fibra. Comparte los nombres ES/EN y la selección con el explorador 3D; cada opción abre el panel del servicio correspondiente. Esta actualización sustituye las referencias históricas al menú de 24 entradas.

## Preparar una copia desde GitHub

El repositorio público excluye `.env` y la carpeta `private/`. Antes de ejecutar una copia nueva, copia `.env.example` a `.env`, configura las credenciales y transfiere por un medio privado el archivo `private/assistant-catalog.txt` desde la instalación original. El catálogo es necesario para las respuestas del asistente. Conserva `private/requests/` en almacenamiento persistente del servidor; no subas solicitudes de clientes al repositorio.

## Contacto, correo Microsoft 365 y derivación del asistente (23/11/2026)

Solutions, Contact us y EN/ES comparten Inter de 14 px (12 px en móviles de hasta 480 px), peso 500 y el mismo interlineado. El asistente ofrece un botón para abrir el formulario y el correo aleon@naitel.com al consultar costos, contacto, información no confirmada o al fallar el proveedor. Las consultas directas de costos/contacto funcionan incluso sin Gemini.

El formulario conserva el folio y la solicitud en disco y notifica a aleon@naitel.com mediante Microsoft Graph. El remitente predeterminado es el mismo buzón; Reply-To contiene el correo del visitante. Requiere completar las variables M365 del servidor y autorización administrativa: ver [MICROSOFT365.md](MICROSOFT365.md). Hasta entonces guarda la solicitud e indica que la notificación está pendiente, sin afirmar que se envió. No hay reenvío automático.

Las indicaciones históricas de más abajo sobre ausencia de notificaciones y derivación a contacto quedan sustituidas por esta sección.

## Complejo conectado en operación y enfoque cinematográfico (23/11/2026)

La nave, el centro de datos, el ala técnica y el acceso forman una sola planta con cimentación, corredor cubierto, cerramiento y circulación compartidos. Los equipos permanecen anclados al lugar al seleccionarlos. Las líneas mueven piezas y cabezales; los gabinetes mantienen sus LEDs y abren las puertas al enfocar el centro de datos. El cableado tiene rutas continuas hasta producción, comunicaciones, energía, climatización, supresión y acceso, con múltiples pulsos visibles. En su enfoque se muestra la ruta completa y el resumen se coloca debajo.

El acceso recorre un ciclo de aproximación, detención, identificación, apertura, paso y cierre. La secuencia está separada en `assets/operation-cycle.mjs`; las pruebas comprueban que el vehículo espere y que la pluma no cierre durante el cruce. La preferencia de movimiento reducido detiene las demostraciones y permite ver las puertas abiertas sin animación.

El enfoque usa dos pasadas de render con la misma cámara: el entorno se atenúa y recibe desenfoque gaussiano, mientras el sistema activo conserva nitidez y posición. El encuadre reserva espacio para el resumen y Assistant, con ajustes por tamaño de pantalla y altura real del panel. El header mide 52 px en escritorio y 48 px en móvil; los botones principales son más bajos y el título conserva su efecto de escritura en la parte superior. Se mantienen idioma, temas, marcas, los 24 servicios de Solutions y el recorrido existente.

Verificación: `node --test operation-cycle.test.mjs tour-playback.test.mjs api.test.cjs chat-policy.test.cjs gemini-request.test.cjs` (24 pruebas). Navegador: complejo completo, apertura de gabinetes, paso vehicular, enfoque de cableado, resúmenes desde Solutions, teclado del menú, ES/EN y ambos temas; comprobados escritorio de 1280 × 800 y móvil de 390 × 844, sin errores de consola. Capturas: `preview-connected-cabling.jpg` y `preview-connected-campus.jpg`.

## Planta de producción y menú Solutions (23/11/2026)

La escena conserva Three.js y las ocho soluciones existentes, ahora distribuidas en un campus industrial más amplio. La nave abierta contiene dos líneas de producción y el puesto de operación; el centro de datos mantiene gabinetes, pasillos y comunicaciones. Un puente de cableado conecta ambos edificios y la entrada incorpora caseta y pluma animada. Las cuatro zonas tienen etiquetas bilingües y selección independiente. La vista inicial usa perspectiva frontal con inclinación suave, sin giro isométrico ni rotación de 90° en móvil.

El menú Solutions/Soluciones incluye las disciplinas 02–24 del catálogo proporcionado y la oferta transversal de software (24 entradas). Excluye identidad, preguntas frecuentes, ejemplos y glosario. Cada entrada abre su resumen ES/EN y usa la transición de cámara existente hacia el sistema relacionado. Se conservan los ocho pasos del recorrido, las marcas y los controles de idioma y tema. El catálogo público contiene únicamente títulos y resúmenes; el archivo privado del asistente no se expone.

Verificación: sintaxis JavaScript y las 21 pruebas existentes aprobadas; revisadas en navegador la escena, la selección de acceso vehicular y cableado, el menú con desplazamiento en 390 × 844, español/inglés y ambos temas. Los cambios funcionan al recargar la dirección habitual, sin reiniciar el servidor.

## Recorrido guiado de ocho servicios

El botón bilingüe «Explorar soluciones / Explore solutions», junto a consultoría, inicia el recorrido por los hotspots 01–08. Cada movimiento dura 1.8 s con interpolación de posición, objetivo de cámara y campo de visión, y easing cúbico de entrada/salida (`power2.inOut`). Después del movimiento aparece una tarjeta con número, servicio y una frase de hasta doce palabras; permanece cuatro segundos. Con movimiento reducido, las transiciones duran 0.18 s y el anillo no pulsa.

La barra inferior permite pausar/reanudar, retroceder, avanzar y cerrar, con contador y progreso. Flechas izquierda/derecha navegan, Espacio alterna pausa y Escape sale. La pausa conserva el tiempo restante y detiene la transición; navegar manualmente mientras está pausado muestra la nueva parada sin reactivar el avance automático. Arrastrar, usar scroll, abrir el asistente/contacto, cambiar el tamaño de pantalla o dejar la pestaña pausa el recorrido. No captura atajos dentro del chat ni de formularios.

Durante el recorrido se ocultan e inhabilitan el hero, la navegación lateral y las herramientas de escena. Header y asistente siguen disponibles. Al cerrar o completar la octava parada vuelve a la cámara inicial y restaura la interfaz. Al completar, muestra «¿Hablamos de tu proyecto?» con acceso al formulario de consultoría y repetición. La funcionalidad se divide entre `tour.js` (interfaz), `tour-playback.mjs` (tiempos/estado) y la cámara existente de `scene.js`.

Verificación: `node --test tour-playback.test.mjs api.test.cjs chat-policy.test.cjs gemini-request.test.cjs` (21 pruebas). Comprobado en navegador: las ocho paradas, pausa/reanudación, navegación manual/teclado, salida, final, consultoría, scroll/arrastre, español/inglés y visualización móvil de 390 × 844 y escritorio en ambos temas. Reiniciar `node server.cjs` después de actualizar: el servidor debe reconocer los dos nuevos módulos públicos.

## Actualización: marca, Gemini y contacto (23/11/2026)

El encabezado conserva icono + nombre en ambos temas. `assets/naitel-mark-white.png` es la versión blanca del mismo icono, con transparencia. La entrada muestra una señal que recorre la pantalla hacia la derecha, pasa por el logo central y continúa; respeta movimiento reducido.

`Contáctanos` en el encabezado/pie y `Solicitar consultoría` abren un formulario bilingüe adaptable a móvil. `POST /api/contact` valida y guarda una solicitud por archivo en `private/requests/<folio>.json`. Se requiere consentimiento. Los datos y archivos del servidor no se sirven por HTTP. Esta versión registra solicitudes en disco; no manda correos ni notificaciones. En producción debe usarse un volumen persistente y revisarse esta carpeta para dar seguimiento.

El chatbot usa `POST /api/chat`, contexto del catálogo íntegro en `private/assistant-catalog.txt` e historial acotado. El servidor reconoce los ocho `serviceId` de la página y destaca sus secciones para interpretar consultas como «¿qué incluye?». Una consulta explícita nueva tiene prioridad sobre el historial y la selección de la página. El clasificador recibe también las respuestas del asistente para interpretar seguimientos; permite orientar aunque falten datos del proyecto y rechaza temas ajenos y consultas mixtas. Después solicita una explicación concreta del servicio: qué resuelve, componentes pertinentes y alcance por evaluar, seguida de hasta dos preguntas útiles. No deriva automáticamente a contacto ni enumera servicios ajenos a la consulta. La respuesta exige respaldo literal en el catálogo; si la clasificación o el respaldo faltan o son inválidos, devuelve una respuesta fija de alcance. El catálogo y los mensajes se tratan como datos, nunca como instrucciones del sistema. La clave permanece en el servidor. El encabezado del chat no muestra el proveedor ni el texto informativo retirado a petición del usuario.

Para activarlo:

1. Copiar `.env.example` a `.env` en esta carpeta.
2. Completar `GEMINI_API_KEY` con la clave de Google AI Studio. No incluirla en HTML, JavaScript público ni repositorios.
3. `GEMINI_MODEL=gemini-flash-lite-latest` es el modelo comprobado en las consultas reales de este proyecto. Si se deja vacío, se descubre un modelo Flash estable mediante la API de modelos.
4. Reiniciar `node server.cjs` desde `C:\Naitel.com\Naitel.com` y abrir la dirección que imprime el servidor. Requiere Node 22+.

Hay límites por IP, validación de origen/tamaño y tiempo de espera. Los errores temporales del proveedor se reintentan hasta tres veces dentro de un presupuesto total de 43 segundos; no se reintentan credenciales rechazadas ni cuota agotada. La interfaz distingue alta demanda, cuota, configuración y tiempo de espera. `GET /api/status` indica configuración, sin exponer credenciales. Las pruebas automatizadas usan un proveedor simulado y no consumen Gemini: `node --test api.test.cjs chat-policy.test.cjs gemini-request.test.cjs`. Las instrucciones anteriores sobre chat de demostración y logo oscuro quedan sustituidas por esta sección.

Se conserva la misma carpeta, HTML/CSS/JavaScript, Three.js r170 y GSAP 3.12.5. No requiere instalar paquetes.

## Ejecutar

Desde C:\Naitel.com:

    node server.cjs

Abrir http://127.0.0.1:4173. Si el servidor de la primera versión sigue abierto, basta con actualizar el navegador con Ctrl+F5. No abrir index.html directamente: los módulos requieren HTTP.

Si PowerShell no reconoce Node, esta es la ruta comprobada en este equipo:

    & "C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1030-493-0_26.1030.493.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe" "C:\Naitel.com\server.cjs"

La ruta del runtime puede cambiar al actualizar la aplicación. Como alternativa, usar una instalación de Node.js disponible en PATH. El servidor escucha solo en el equipo local; Ctrl+C lo detiene.

## Cambios de esta versión

1. Logo oficial intacto, D3 Euronism local y clase .brand automática para las menciones de NAITEL.
2. Encabezado compacto con título clamp(2rem, 3.6vw, 3.25rem), máquina de escribir y subtítulo; sin rótulos decorativos.
3. Marcadores numéricos discretos: el nombre corto aparece con hover o foco; el nombre completo permanece en el panel.
4. Barra horizontal con ocho números, flechas, tooltips, progreso y desplazamiento con snap en móvil; posición estable al abrir un servicio.
5. Distribución ampliada un 40 %, zoom óptico 1.275 y cámaras que encuadran la geometría proyectada. Se conservan panel, chatbot, temas, videos y transiciones.

La escena es una maqueta conceptual; sus proporciones y recorridos no son planos de ingeniería ni especificaciones de instalación.

## Logo y tipografía

El nuevo logo se conserva sin alteraciones en assets/naitel-official.png. Su SHA-256 coincide con el adjunto original. El archivo tiene su propio fondo claro; una tarjeta blanca mantiene su legibilidad en modo oscuro, sin cambiar sus colores. El recurso blanco de la versión anterior queda archivado en assets/logo-adjunto-original.png.

Para incorporar el logo oficial sin alterarlo, guardar el archivo en assets/ y configurar su ruta en config.logo de content.js. Se carga automáticamente y oculta el marcador.

La fuente real D3 Euronism de Digital Dream Design se carga mediante @font-face desde assets/d3-euronism/D3Euronism.ttf. Fuente de descarga: [distribución de D3 Euronism](https://www.dafont.com/d3euronism.font). El archivo readme.htm del autor se conserva junto a la fuente: aunque el distribuidor la etiqueta como gratuita, ese readme limita el uso gratuito al ámbito privado y pide autorización para uso comercial y redistribución. Esta entrega es una revisión local; comprueba la autorización correspondiente antes de publicarla.

brand.js envuelve automáticamente cada palabra Naitel/NAITEL de los nodos de texto con un span.brand, conservando mayúsculas y minúsculas. Incluye textos de marca, pie, encabezado del chat, mensajes propios y respuestas dinámicas. MutationObserver cubre contenido añadido y cambios de idioma, sin anidar envoltorios. Excluye scripts, atributos, campos editables y el archivo del logo. Inter permanece en títulos y panel; los detalles técnicos existentes conservan su fuente previa.

La tipografía de la pestaña del navegador no admite CSS de la página. document.title conserva NAITEL como texto plano, traduciendo el resto del título. No se introducen etiquetas HTML en el título ni en atributos accesibles.

## Idioma, contenido y videos

content.js contiene ocho servicios y todas las etiquetas ES/EN, incluyendo textos accesibles y mensajes de ejemplo del chat. EN es el idioma inicial. El selector vuelve a escribir el título en cada cambio. Los mensajes escritos por la persona y las respuestas de un proveedor externo no se traducen automáticamente.

Cada servicio admite:
- name / short / en: nombres del panel y de la escena.
- description / descriptionEn: una frase de hasta 20 palabras.
- features / featuresEn: dos o tres puntos de hasta seis palabras.
- position y label: ubicación del equipo y su etiqueta.
- video: ruta MP4 propia; vacío utiliza el placeholder general.
- modelUrl: campo reservado para una incorporación futura de GLB.

config.ambientVideo y config.videoOpacity mantienen el clip general y su opacidad 0.12. El video incluido es un placeholder compartido, no ocho tomas específicas. La fuente validada es:
https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4

Sustituir los clips por material pertinente y con permiso de uso para producción. Se conservan autoplay, muted, loop, playsinline, el poster assets/ambient.svg y el crossfade de doble buffer. Los videos se pausan al activar la pausa o prefers-reduced-motion.

Los colores siguen en las variables iniciales de styles.css. Los materiales de equipos y plataforma están al inicio de scene.js. La base ahora tiene el acabado oscuro mate solicitado también en modo claro.

## Conectar el chatbot

La función pública está en app.js:

    window.openChatbot(prefilledMessage)

El botón del panel la llama con una consulta sobre el servicio. El mensaje queda precargado para que la persona pueda editarlo y enviarlo. El widget responde con contenido de ejemplo; no hace peticiones de red ni almacena conversaciones.

También se publica un evento:

    window.addEventListener('naitel:chat-open', event => {
      // event.detail: prefilledMessage, serviceId, language
    });

Para conectar un backend real, definir antes de enviar una consulta:

    window.NAITEL_CHAT_ADAPTER = async ({ message, serviceId, language }) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, serviceId, language })
      });
      if (!response.ok) throw new Error('Chat unavailable');
      const data = await response.json();
      return data.reply; // Debe devolver una cadena.
    };

El endpoint del ejemplo NO existe en este prototipo. Debe implementarse en un backend para producción; no colocar claves de proveedores en el navegador. El adaptador sustituye las respuestas locales. Actualizar también el aviso de demo y el aviso de tratamiento de datos al activar ese backend.

Enter envía el mensaje; Shift+Enter crea una línea nueva. Escape cierra primero el chat y luego, si se vuelve a pulsar, el panel.

## Escena y modelos

scene.js conserva InfrastructureScene, cámara de perspectiva, iluminación, raycasting, postprocesado ligero, carga diferida y geometrías procedurales. SPACING=1.4 amplía el trazado, la plataforma, los pasillos, las posiciones y los recorridos; los gabinetes conservan su escala física. Las charolas y la tubería continúan conectadas a sus zonas.

framing() usa zoom óptico 1.275 y ajusta la distancia a la silueta proyectada de la geometría real. Compensa la asimetría de la perspectiva para aprovechar el encuadre sin cortar la plataforma en la vista general. En detalle protege el equipo principal dentro del área visible junto al panel; el resto del site puede salir del encuadre durante el acercamiento. El tamaño de la escena es aproximadamente 71 vh a 1440×900 y 75 vh a 1920×1080, adaptándose al espacio disponible en tablet y móvil.

replaceEquipment(index, model) mantiene el punto de extensión para GLB. Incorporar GLTFLoader de la misma versión de Three.js, normalizar escala y origen y llamar al método con gltf.scene. El campo modelUrl no carga modelos automáticamente.

## Accesibilidad y rendimiento

Foco visible, alternativa HTML con los ocho servicios, etiquetas bilingües, navegación por flechas y Escape, pausa visible y movimiento reducido. En móvil el encuadre se adapta en vertical y el panel aparece como hoja inferior.

El pixel ratio sigue limitado. Sombras, partículas y postprocesado se omiten en dispositivos que reportan pocos recursos. La tasa de cuadros depende del equipo; no se garantiza una cifra universal.

## Verificación

Se comprobó la sintaxis de app.js, brand.js, scene.js, content.js y server.cjs. Se revisaron los tamaños 1440×900, 1920×1080, 768×1024 y 390×844, sin solapes entre encabezado, escena, barra y burbuja. qa-layout-v3.json contiene las mediciones. Se verificaron también selección, posición estable de la barra, desplazamiento interno móvil, consulta precargada, respuesta local, marca en mensajes dinámicos, EN/ES y tema oscuro. Las capturas se entregan en preview-v3.png y preview-v3-mobile.png.

## Archivos

index.html: estructura. styles.css: estilos y responsive. content.js: textos y configuración. scene.js: site procedural. app.js: interacción, traducción y chat. brand.js: marcado automático de marca. server.cjs: servidor local. assets/: recursos y licencias. vendor/: dependencias locales.

Inter: SIL Open Font License, assets/Inter-LICENSE.txt.
Michroma: SIL Open Font License, assets/Michroma-LICENSE.txt.
Three.js: MIT, aviso en vendor/three.module.js.
GSAP: licencia estándar y aviso en vendor/gsap.min.js.


## Actualización visual y cableado

Ejecutar desde `C:\Naitel.com\Naitel.com`: `node server.cjs`.
`cabling.js` contiene el puesto de usuario, canalizaciones separadas, patch panels, ODF, herramientas, pulsos y capas de despiece. `brands.js` comparte la carga de SVG entre panel y cinta. Las fuentes de logos se registran en `assets/brands/sources.json` cuando estén disponibles.
`model-loader.js` carga GLB con Draco y KTX2 locales de Three.js r170; las rutas se configuran en `content.js` mediante `modelUrl`. Carpeta preparada: `assets/models/`.
Se conserva la arquitectura modular sin bundle único. Los detalles existentes siguen construyéndose junto con los objetos; partículas, entorno y postprocesado se difieren. El entorno de reflejos es procedural (RoomEnvironment), no una foto HDRI. Las sombras de contacto son texturas radiales, no AO horneado en Blender. Los logotipos grabados en equipos no se inventan.
La intro se puede saltar con clic o tecla y se omite durante el resto de la sesión. Su overlay tiene un límite de 1.8 s; el tiempo de construcción de WebGL depende del equipo. Los videos se inician después del primer render y se pausan al ocultarse la pestaña.
Ver `qa-current.json`: primer render observado aproximadamente 2.1–2.7 s en el navegador integrado. No se ha alcanzado/verificado el objetivo de 60 FPS en ese entorno. Los cinco tamaños comprobados no generaron scroll de página; los paneles conservan scroll interno.

/* Contenido bilingüe. Sin promesas comerciales ni certificaciones. */
export const config = {logo:'assets/naitel-official.png',ambientVideo:'assets/ambient-sample.mp4',videoOpacity:.12,privacy:{es:"assets/privacy-document-es.json",en:null}};
// La versión oscura conserva el mismo icono y la misma composición en blanco.
export const services = [
{id:'data',name:'Racks y pasillos',short:'Racks y pasillos',en:'Racks & aisles',position:[9,-2],label:[-1,2.8,0],description:'Gabinetes, contención y distribución según tu carga.',descriptionEn:'Cabinets, containment and layouts built around your load.',features:['Gabinetes y PDUs','Pasillos frío y caliente','Piso técnico y contención'],featuresEn:['Cabinets and PDUs','Cold and hot aisles','Raised floors and containment']},
{id:'cooling',name:'Climatización de precisión',short:'Climatización',en:'Precision cooling',position:[16,-2],label:[0,.15,1.9],description:'Control térmico y flujo de aire para tu infraestructura crítica.',descriptionEn:'Thermal control and airflow for your critical infrastructure.',features:['Unidades InRow','Distribución de aire','Monitoreo ambiental'],featuresEn:['InRow units','Air distribution','Environmental monitoring']},
{id:'power',name:'Energía crítica',short:'Energía crítica',en:'Critical power',position:[16,6],label:[0,.15,1.5],description:'Respaldo y distribución eléctrica para los equipos esenciales de tu operación.',descriptionEn:'Backup power and electrical distribution for your essential equipment.',features:['Sistemas UPS','Bancos de baterías','Distribución eléctrica'],featuresEn:['UPS systems','Battery banks','Power distribution']},
{id:'fiber',name:'Cableado y fibra',short:'Cableado y fibra',en:'Cabling & fiber',position:[0,-2],label:[0,3.35,0],description:'Cobre y fibra, del diseño a la organización y documentación.',descriptionEn:'Copper and fiber, from design to organization and documentation.',features:['Charolas aéreas','Cobre y fibra óptica','Organización y documentación'],featuresEn:['Overhead cable trays','Copper and fiber optics','Organization and documentation']},
{id:'network',name:'Switches y routers',short:'Switches y routers',en:'Switches & routers',position:[9,-5],label:[0,.15,1.3],description:'Redes segmentadas y conectividad para los sistemas de tu operación.',descriptionEn:'Segmented networks and connectivity for your operational systems.',features:['Rack de comunicaciones MDF','Switching y routing','Patch panels y segmentación'],featuresEn:['MDF communications rack','Switching and routing','Patch panels and segmentation']},
{id:'security',name:'CCTV y accesos',short:'CCTV y accesos',en:'CCTV & access',position:[-3,9],label:[0,.15,1.4],description:'Visibilidad y control de acceso integrados a tus espacios críticos.',descriptionEn:'Visibility and access control integrated into your critical spaces.',features:['Videovigilancia IP','Lectores y torniquetes','Gestión de accesos'],featuresEn:['IP video surveillance','Readers and turnstiles','Access management']},
{id:'fire',name:'Supresión con agente limpio',short:'Agente limpio',en:'Gas suppression',position:[16,-8],label:[0,.15,2.2],description:'Detección y supresión con agente limpio para cuartos críticos.',descriptionEn:'Clean agent detection and suppression for critical rooms.',features:['Cilindros de agente limpio','Tubería y boquillas','Detección y supervisión'],featuresEn:['Clean agent cylinders','Piping and nozzles','Detection and supervision']},
{id:'software',name:'Desarrollo de software',short:'Software',en:'Software',position:[-9,-2],label:[0,.15,1.2],description:'Herramientas digitales para conectar procesos, información y equipos de trabajo.',descriptionEn:'Digital tools connecting processes, information and teams.',features:['Aplicaciones a medida','Integraciones ERP y CRM','Paneles de operación'],featuresEn:['Custom applications','ERP and CRM integrations','Operations dashboards']}
].map(s=>({video:'',modelUrl:null,...s}));
// Shared route: access, office, data-center services, then cabling in production.
export const serviceRoute=[5,7,0,4,1,2,6,3].map(index=>({index,production:index===3}));
// Short summaries for the compact service panel; full descriptions remain above.
export const panelSummaries = {
  data:['Gabinetes, contención y distribución eléctrica.','Racks, containment and power distribution.'],
  cooling:['Climatización de precisión y monitoreo ambiental.','Precision cooling and environmental monitoring.'],
  power:['Respaldo eléctrico para equipos críticos.','Backup power for critical equipment.'],
  fiber:['Cableado de cobre y fibra organizado.','Organized copper and fiber connectivity.'],
  network:['Redes segmentadas, switching y routing.','Segmented networks, switching and routing.'],
  security:['Videovigilancia y control de accesos integrados.','Integrated video surveillance and access control.'],
  fire:['Detección y supresión con agente limpio.','Clean agent detection and fire suppression.'],
  software:['Aplicaciones a medida e integraciones empresariales.','Custom applications and business integrations.']
};
// Pares ES / EN: textos visibles, accesibilidad y mensajes del chat.
export const translations = {
tourStart:['Ver recorrido','Take the tour'],tourPause:['Pausar','Pause'],tourResume:['Reanudar','Resume'],tourControls:['Controles del recorrido','Tour controls'],tourProgress:['Progreso del recorrido','Tour progress'],tourEnding:['¿Hablamos de tu proyecto?','Shall we discuss your project?'],tourRepeat:['Repetir recorrido','Repeat tour'],
brandsTitle:['Marcas con las que trabajamos','Brands we work with'],privacyNotice:['Aviso de privacidad','Privacy notice'],privacySpanish:['','Spanish original. An English version can be added here.'],privacyLoading:['Cargando aviso…','Loading notice…'],linkEstablished:['enlace establecido','link established'],
solutions:['Soluciones','Solutions'],eyebrow:['INFRAESTRUCTURA QUE CONECTA TODO','INFRASTRUCTURE THAT CONNECTS EVERYTHING'],
caption:['Integramos redes e infraestructura para mantener tu operación conectada.','We integrate networks and infrastructure to keep your operations connected.'],
prototype:['PROTOTIPO INTERACTIVO','INTERACTIVE PROTOTYPE'],
solution:['SOLUCIÓN INTEGRADA','INTEGRATED SOLUTION'],quote:['Preguntar en el chatbot','Ask in chatbot'],back:['Volver','Back'],chat:['Assistant','Assistant'],
loading:['INTEGRANDO POSIBILIDADES','INTEGRATING POSSIBILITIES'],brandDetail:['INFRAESTRUCTURA TECNOLÓGICA','TECHNOLOGY INFRASTRUCTURE'],
skip:['Ir a los servicios','Skip to services'],home:['NAITEL, volver al inicio','NAITEL, back to overview'],navigation:['Navegación principal','Main navigation'],
experience:['Explorador interactivo de soluciones','Interactive solutions explorer'],scene:['Site de infraestructura 3D de NAITEL','NAITEL 3D infrastructure site'],
serviceIndex:['Navegación de servicios','Service navigation'],exploreServices:['Explorar servicios','Explore services'],allServices:['Todos los servicios','All services'],
accessibleTitle:['Soluciones de infraestructura tecnológica','Technology infrastructure solutions'],reset:['Restablecer vista','Reset view'],
pause:['Pausar animaciones','Pause animations'],resume:['Reanudar animaciones','Resume animations'],light:['Activar modo claro','Switch to light mode'],dark:['Activar modo oscuro','Switch to dark mode'],
previous:['Servicio anterior','Previous service'],next:['Servicio siguiente','Next service'],close:['Cerrar','Close'],
fallbackTitle:['Explora nuestras soluciones','Explore our solutions'],fallback:['La vista 3D no está disponible. Usa los ocho servicios de abajo.','The 3D view is unavailable. Use the eight services below.'],
pageTitle:['NAITEL — Soluciones de infraestructura','NAITEL — Infrastructure solutions'],pageDescription:['Explora ocho soluciones de infraestructura tecnológica de NAITEL en un site 3D interactivo.','Explore eight NAITEL technology infrastructure solutions in an interactive 3D site.'],
chatTitle:['NAITEL — Hablemos de tu proyecto.','NAITEL — Let’s talk about your project.'],chatStatus:['CHAT DE EJEMPLO','DEMO CHAT'],
chatNote:['Demo local. No envía ni almacena datos.','Local demo. No data is sent or stored.'],chatMessage:['Tu mensaje','Your message'],
chatPlaceholder:['Escribe tu consulta…','Type your question…'],send:['Enviar mensaje','Send message'],
greeting:['Hola. Soy el asistente de ejemplo de NAITEL. ¿Qué solución te gustaría explorar?','Hello. I’m NAITEL’s demo assistant. Which solution would you like to explore?'],
demoReply:['Elige un servicio para explorar sus puntos clave. Este chat es una demostración; aún no está conectado a un asesor.','Choose a service to explore its key features. This is a demo chat; it is not yet connected to an advisor.'],
demoEnding:['Respuesta de ejemplo. La integración con un chatbot real está pendiente.','Sample response. Integration with a live chatbot is pending.'],
typing:['Preparando respuesta…','Preparing a response…'],chatError:['No se pudo obtener una respuesta. Intenta de nuevo.','Could not retrieve a response. Please try again.']
};


Object.assign(translations,{caption:["Redes e infraestructura que mantienen tu operación conectada.","Networks and infrastructure that keep your operation connected."],heroSupport:["Consultoría, ingeniería, integración y soporte para tus proyectos de TI.","Consulting, engineering, integration and support for your IT projects."],consultation:["Solicitar consultoría","Request a consultation"],exploreSolutions:["Explorar soluciones","Explore solutions"],serviceTags:["Servicios","Services"],products:["Marcas / Productos","Brands / Products"],brandsTitle:["Partners","Partners"],quote:["Solicitar cotización","Request a quote"],chatTitle:["Naitel AI","Naitel AI"],chatStatus:["En línea · demo","Online · demo"],pageTitle:["Naitel | Redes e infraestructura","Naitel | Networks and infrastructure"]});

/* Contacto y asistente conectado; pares ES / EN. */
Object.assign(translations,{
contactLink:['Contáctanos','Contact us'],contactEyebrow:['CONECTEMOS TU PROYECTO','LET’S CONNECT'],contactTitle:['Cuéntanos qué necesitas','Tell us about your project'],contactDescription:['Comparte tu idea o los retos de tu empresa. Empecemos a definir la solución.','Share your idea or your business challenges. Let’s start defining the solution.'],
contactName:['Nombre completo *','Full name *'],contactCompany:['Empresa','Company'],contactEmail:['Correo electrónico *','Email *'],contactPhone:['Teléfono','Phone'],contactService:['Servicio de interés *','Service *'],contactLocation:['Ciudad / ubicación del proyecto','City / project location'],contactChoose:['Selecciona un servicio','Select a service'],contactMessage:['¿Qué necesitas? *','What do you need? *'],contactPlaceholder:['Cuéntanos el alcance, capacidad aproximada y fechas deseadas…','Tell us about the scope, approximate capacity and target dates…'],
contactConsent:['He leído y acepto el aviso de privacidad y autorizo el uso de mis datos para atender esta solicitud.','I have read and accept the privacy notice and consent to the use of my information to respond to this request.'],contactPrivacyError:['No se pudo cargar el aviso. Cierra esta sección y vuelve a abrirla para intentar de nuevo.','Could not load the notice. Close this section and reopen it to try again.'],contactSubmit:['Enviar solicitud','Send request'],contactSending:['Registrando tu solicitud…','Registering your request…'],contactSuccess:['Solicitud registrada y notificación aceptada por correo. Tu folio:','Request registered and email notification accepted. Your reference:'],contactSaved:['Solicitud guardada. Tu folio:','Request saved. Your reference:'],contactEmailFallback:['La notificación por correo está pendiente. También puedes escribir a aleon@naitel.com.','Email notification is pending. You can also email aleon@naitel.com.'],contactError:['No se pudo registrar. Revisa tu conexión e intenta nuevamente.','Could not register your request. Check your connection and try again.'],consultingService:['Consultoría e ingeniería','Consulting & engineering'],managedService:['Servicios administrados / mantenimiento','Managed services / maintenance'],otherService:['Otro / Necesito orientación','Other / Help me choose'],
chatSetup:['Asistente · pendiente de activar','Assistant · setup pending'],chatSetupNote:['La IA aún no está activada. Puedes registrar tu proyecto en Contáctanos.','AI is not activated yet. You can register your project through Contact us.'],greeting:['Hola, soy el asistente de NAITEL. Puedo orientarte sobre infraestructura, redes, seguridad y desarrollo de software. Para costos o consultas que requieran atención del equipo, abre Contáctanos o escribe a aleon@naitel.com. ¿Qué necesita tu proyecto?','Hello, I’m NAITEL’s assistant. I can help with infrastructure, networking, security and software development. For pricing or questions that need our team, open Contact us or email aleon@naitel.com. What does your project need?']
});

Object.assign(translations,{
chatBusy:['El servicio está ocupado temporalmente. Intenta de nuevo en unos momentos.','The service is temporarily busy. Please try again shortly.'],
chatQuota:['El asistente no está disponible porque se alcanzó el límite de uso del proveedor. Puedes registrar tu proyecto en Contáctanos.','The assistant is unavailable because the provider usage limit was reached. You can register your project through Contact us.'],
chatAuth:['El asistente tiene un problema de configuración. Puedes registrar tu proyecto en Contáctanos.','The assistant has a configuration issue. You can register your project through Contact us.'],
chatTimeout:['La respuesta tardó demasiado. Intenta nuevamente o registra tu proyecto en Contáctanos.','The response took too long. Please try again or register your project through Contact us.'],
chatRateLimit:['Has enviado varias consultas seguidas. Espera un minuto antes de intentar nuevamente.','You have sent several questions in a row. Please wait a minute before trying again.']
});

// Public service titles and summaries derived from the supplied catalog.
export const catalogServices = [
  {
    "id": "catalog-02",
    "name": "Consultoría e ingeniería de centros de datos",
    "en": "Data center consulting & engineering",
    "target": 0,
    "summary": "Diseño, modernización y operación de salas de telecomunicaciones, cuartos de equipo, edge rooms y centros de datos empresariales.",
    "summaryEn": "Planning and integration of data center architecture, capacity and infrastructure."
  },
  {
    "id": "catalog-03",
    "name": "Climatización de precisión y gestión térmica",
    "en": "Precision cooling & thermal management",
    "target": 1,
    "summary": "Sistemas CRAC, CRAH, unidades InRow, expansión directa (DX), agua helada, condensación remota, enfriamiento sensible, free-cooling viable y monitoreo térmico para infraestructura TI.",
    "summaryEn": "Precision cooling, airflow and environmental monitoring for critical infrastructure."
  },
  {
    "id": "catalog-04",
    "name": "Contención de pasillo frío y caliente",
    "en": "Hot & cold aisle containment",
    "target": 0,
    "summary": "Integración de puertas, panelería, techos modulares, barreras, cepillos, blanking panels, gabinetes, controles de acceso a pasillo y coordinación con incendios para separar corrientes de aire y reducir recirculación y mezcla.",
    "summaryEn": "Hot and cold aisle containment, coordinated with cooling and fire protection."
  },
  {
    "id": "catalog-05",
    "name": "Piso falso, bases y obra complementaria",
    "en": "Raised floors & complementary works",
    "target": 0,
    "summary": "Diseño e implementación de piso técnico elevado para distribución de aire o canalizaciones, con opciones de paneles antiestáticos, pedestales, travesaños, recubrimientos y soluciones de carga específicas.",
    "summaryEn": "Raised floors, structural supports and complementary installation works."
  },
  {
    "id": "catalog-06",
    "name": "Gabinetes, racks, pdus y accesorios",
    "en": "Cabinets, racks, PDUs & accessories",
    "target": 0,
    "summary": "Suministro y montaje de gabinetes para servidores, telecomunicaciones, networking y edge, abiertos/cerrados, profundidad y capacidad definidas, puertas perforadas, bandejas, organizadores, paneles ciegos, sensores y distribución eléctrica en rack.",
    "summaryEn": "Server and network cabinets, rack power distribution and accessories."
  },
  {
    "id": "catalog-07",
    "name": "Protección contra incendio con agentes limpios",
    "en": "Clean agent fire protection",
    "target": 6,
    "summary": "Soluciones de detección temprana, alarma, control y supresión mediante agente limpio para recintos tecnológicos donde sea aplicable.",
    "summaryEn": "Early detection, alarms and engineered clean agent suppression."
  },
  {
    "id": "catalog-08",
    "name": "Sistemas de energía crítica y calidad de energía",
    "en": "Critical power & power quality",
    "target": 2,
    "summary": "Diseño, integración y mantenimiento de UPS, tableros, circuitos, ATS, bypass de mantenimiento, banco de baterías, monitoreo, supresión de sobretensiones, puesta a tierra y coordinación de protecciones para TI y operación esencial.",
    "summaryEn": "UPS, batteries, electrical distribution and power quality systems."
  },
  {
    "id": "catalog-09",
    "name": "Plantas de emergencia y transferencia",
    "en": "Generators & transfer systems",
    "target": 2,
    "summary": "Ingeniería y coordinación para generadores diésel, gas u otras tecnologías, tableros ATS, distribución de emergencia y supervisión remota; dimensionamiento conforme a cargas críticas, picos de arranque, secuencia de entrada y condiciones ambientales.",
    "summaryEn": "Backup generators and transfer systems coordinated with critical loads."
  },
  {
    "id": "catalog-10",
    "name": "Cableado estructurado de cobre",
    "en": "Structured copper cabling",
    "target": 3,
    "summary": "Planeación, ingeniería, instalación y certificación de enlaces de datos para redes empresariales, industriales y telecom, categorías 6 y 6A, para puestos, AP Wi-Fi, cámaras IP, control de accesos, telefonía y equipos OT cuando corresponda.",
    "summaryEn": "Design, installation, organization and testing of copper cabling."
  },
  {
    "id": "catalog-11",
    "name": "Fibra óptica interna y externa",
    "en": "Indoor & outdoor fiber optics",
    "target": 3,
    "summary": "Infraestructura multimodo OM3/OM4/OM5 cuando tenga sentido, monomodo OS2 y conectividad MPO/MTP, LC y otras interfaces autorizadas; enlaces troncales MDF-IDF, backbone campus, data center, plantas internas y externas.",
    "summaryEn": "Indoor and outdoor fiber links, routing, termination and documentation."
  },
  {
    "id": "catalog-12",
    "name": "Redes lan, campus, data center y sd-wan",
    "en": "LAN, campus, data center & SD-WAN",
    "target": 4,
    "summary": "Diseño e integración de switching L2/L3, segmentación VLAN, enlaces 1/10/25/40/100GbE cuando aplicables, enrutamiento, redundancia, QoS, multicast, NAC e interconexión de sedes.",
    "summaryEn": "Segmented enterprise networks, switching, routing and site connectivity."
  },
  {
    "id": "catalog-13",
    "name": "Ciberseguridad, firewalls y acceso seguro",
    "en": "Cybersecurity, firewalls & secure access",
    "target": 4,
    "summary": "Fortinet/FortiGate, Palo Alto, Cisco y ecosistemas compatibles para seguridad perimetral, microsegmentación, VPN, filtrado web/DNS, seguridad de aplicaciones, IDS/IPS, MFA, ZTNA/SASE según licenciamiento y arquitectura.",
    "summaryEn": "Firewalls, network protection and secure access according to project requirements."
  },
  {
    "id": "catalog-14",
    "name": "Cctv y videovigilancia ip",
    "en": "CCTV & IP video surveillance",
    "target": 5,
    "summary": "Soluciones de diseño, modernización y soporte para videovigilancia IP, VMS, grabación, almacenamiento, analítica y operación.",
    "summaryEn": "IP cameras, video management, recording and coverage planning."
  },
  {
    "id": "catalog-15",
    "name": "Control de accesos, identidad física e intrusión",
    "en": "Access control, physical identity & intrusion",
    "target": 5,
    "summary": "Diseño, instalación y mantenimiento de control de accesos para puertas, torniquetes, esclusas, casetas y áreas restringidas, usando plataformas LenelS2, Honeywell y Rosslare según compatibilidad/modelo; posibilidad de integración VMS/alarma cuando se valide API y licencias.",
    "summaryEn": "Access readers, vehicle barriers, physical identity and intrusion detection."
  },
  {
    "id": "catalog-16",
    "name": "Sistemas especiales e integración",
    "en": "Special systems & integration",
    "target": 7,
    "summary": "Integración controlada de detección de intrusión, alarmas, sensores ambientales, comunicaciones de emergencia, voceo industrial, interfonía, BMS, supervisión de incendios y sistemas electrónicos complementarios.",
    "summaryEn": "Integration of special systems with the production facility infrastructure."
  },
  {
    "id": "catalog-17",
    "name": "Servidores, almacenamiento e hiperconvergencia",
    "en": "Servers, storage & hyperconvergence",
    "target": 0,
    "summary": "Diseño y suministro de soluciones rack/tower/blade y almacenamiento local/SAN/NAS, virtualización y plataformas hiperconvergentes de Dell Technologies, HPE, Lenovo, Cisco y Nutanix donde oferta, compatibilidad y licencias lo permitan.",
    "summaryEn": "Server, storage and hyperconverged platforms sized for business workloads."
  },
  {
    "id": "catalog-18",
    "name": "Respaldos, recuperación y continuidad",
    "en": "Backup, recovery & continuity",
    "target": 0,
    "summary": "Políticas de respaldo de servidores, VMs, bases de datos, archivos, SaaS y configuraciones de red, más recuperación ante desastre.",
    "summaryEn": "Backup and recovery solutions based on continuity requirements."
  },
  {
    "id": "catalog-19",
    "name": "Licenciamiento y productividad empresarial",
    "en": "Enterprise licensing & productivity",
    "target": 7,
    "summary": "Asesoría de licenciamiento, suministro y administración de soluciones Microsoft y Autodesk, así como Minitab u otras plataformas cuando se validen contratos de distribución y productos autorizados.",
    "summaryEn": "Enterprise software licensing and productivity platforms."
  },
  {
    "id": "catalog-20",
    "name": "Soporte de cómputo personal y mesa de ayuda",
    "en": "Desktop support & service desk",
    "target": 7,
    "summary": "Soporte preventivo/correctivo de estaciones de trabajo, portátiles, periféricos, impresoras, sistemas operativos y herramientas de colaboración, con gestión de activos, tickets, SLA y control de evidencia.",
    "summaryEn": "Desktop support and service desk coverage defined for each project."
  },
  {
    "id": "catalog-21",
    "name": "Servicios administrados y pólizas",
    "en": "Managed services & maintenance",
    "target": 7,
    "summary": "Contratos de gestión continua para CCTV, energía, UPS, infraestructura, centros de datos, redes, seguridad y sistemas especiales.",
    "summaryEn": "Preventive and corrective maintenance with agreed service coverage."
  },
  {
    "id": "catalog-22",
    "name": "Monitoreo, dcim, telemetría y reportería",
    "en": "Monitoring, DCIM, telemetry & reporting",
    "target": 7,
    "summary": "Centralización de alarmas de infraestructura con SNMP, APIs, syslog, Modbus/BACnet y herramientas de monitoreo/visualización compatibles, incluyendo paneles Grafana/Prometheus o soluciones DCIM empresariales según proyecto.",
    "summaryEn": "Infrastructure alarms, telemetry and operational dashboards."
  },
  {
    "id": "catalog-23",
    "name": "Gestión de proyectos y aseguramiento de calidad",
    "en": "Project management & quality assurance",
    "target": 7,
    "summary": "Gobierno integral del ciclo de implementación bajo criterios de alcance, tiempo, costo, riesgo, calidad, seguridad y comunicación.",
    "summaryEn": "Project planning, multidisciplinary coordination and quality assurance."
  },
  {
    "id": "catalog-24",
    "name": "Normatividad, reglamentación y buenas prácticas",
    "en": "Standards, regulations & best practices",
    "target": 7,
    "summary": "Las normas citadas son un mapa de consulta, no una declaración indiscriminada de cumplimiento o obligatoriedad.",
    "summaryEn": "Technical reference review according to project scope and local requirements."
  },
  {
    "id": "catalog-software",
    "name": "Desarrollo de software a medida",
    "en": "Custom software development",
    "target": 7,
    "summary": "ERP, CRM y aplicaciones de checklist para revisiones CTPAT, con módulos e integraciones definidos por proyecto.",
    "summaryEn": "Custom ERP, CRM and CTPAT checklist applications, with project-specific modules and integrations."
  }
];

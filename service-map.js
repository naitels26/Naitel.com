// Official categories are separate from the eight existing equipment demonstrations.
// Coordinates refer only to architecture and equipment already present in scene.js.
export const serviceCategories = [
  {id:'connectivity',code:'A',name:['Conectividad e infraestructura','Connectivity & Infrastructure'],short:['Conectividad','Connectivity'],zone:['Charolas, fibra y MDF','Cable trays, fiber & MDF'],index:3,production:true,color:'#227caa',
    summary:['Conectividad empresarial desde el diseño de red hasta su implementación.','Business connectivity from network design through implementation.'],
    capabilities:[['Cableado estructurado','Structured Cabling'],['Fibra óptica','Fiber Optics'],['Redes inalámbricas','Wireless Networks'],['Diseño e implementación de redes','Network Design & Implementation'],['Infraestructura de telecomunicaciones','Telecommunications Infrastructure']]},
  {id:'cybersecurity',code:'B',name:['Ciberseguridad y redes OT','Cybersecurity & OT Networks'],short:['Redes OT','OT networks'],zone:['Planta de producción','Production floor'],index:7,sceneZone:'production',color:'#3268ae',
    summary:['Segmentación y conectividad segura para redes empresariales e industriales.','Segmentation and secure connectivity for enterprise and industrial networks.'],
    capabilities:[['Segmentación de redes industriales','Industrial Network Segmentation'],['Segmentación de redes empresariales','Enterprise Network Segmentation'],['Integración de firewalls','Firewall Integration'],['Conectividad segura','Secure Connectivity'],['Continuidad operativa','Operational Continuity']],
    note:['La segmentación y las medidas de seguridad se definen según la red y los requerimientos de operación.','Segmentation and security measures are defined according to the network and operational requirements.']},
  {id:'security',code:'C',name:['Protección de activos y seguridad física','Asset Protection & Physical Security'],short:['Seguridad física','Physical security'],zone:['Cámara, caseta y acceso','Camera, gatehouse & access'],index:5,color:'#72629c',
    summary:['Videovigilancia y control de acceso para proteger tus instalaciones.','Surveillance and access control to protect your facilities.'],
    capabilities:[['Videovigilancia CCTV','CCTV Surveillance'],['Control de acceso','Access Control'],['Integración de plataformas de video','Video Platform Integration'],['Analítica de video','Video Analytics']]},
  {id:'power',code:'D',name:['Energía crítica','Critical Power'],short:['Energía crítica','Critical power'],zone:['UPS, baterías y respaldo','UPS, batteries & backup'],index:2,color:'#be722e',
    summary:['Respaldo energético e infraestructura para la operación esencial.','Power backup and infrastructure for essential operations.'],
    capabilities:[['Sistemas UPS','UPS Systems'],['Generadores de emergencia','Emergency Power Generators'],['Infraestructura de energía crítica','Critical Power Infrastructure']]},
  {id:'datacenters',code:'E',name:['Centros de datos','Data Centers'],short:['Centros de datos','Data centers'],zone:['Racks y servicios técnicos','Racks & technical services'],index:0,color:'#288f9c',
    summary:['Ingeniería e integración de infraestructura para centros de datos.','Infrastructure engineering and integration for data centers.'],
    capabilities:[['Energía crítica','Critical Power'],['Climatización de precisión','Precision Cooling'],['Infraestructura de telecomunicaciones','Telecommunications Infrastructure'],['Monitoreo de infraestructura','Infrastructure Monitoring']]},
  {id:'software',code:'F',name:['Desarrollo de software','Software Development'],short:['Software','Software'],zone:['Puesto de trabajo conectado','Connected workstation'],index:7,color:'#4d8490',
    summary:['Software e integración para optimizar procesos y automatizar tareas.','Software and integration to optimize processes and automate tasks.'],
    capabilities:[['Optimización de procesos de negocio','Business Process Optimization'],['Desarrollo de software a medida','Custom Software Development'],['Integración de sistemas','Systems Integration'],['Automatización de tareas','Task Automation']],
    note:['La arquitectura y el alcance se definen según los requerimientos del cliente.','Architecture and scope are defined according to the client’s requirements.']},
  {id:'engineering',code:'G',name:['Ingeniería y gestión integral de proyectos','Engineering & Integrated Project Management'],short:['Ingeniería','Engineering'],zone:['Edificio corporativo · planta alta','Corporate building · upper floor'],index:7,sceneZone:'corporate',color:'#426b94',
    summary:['Acompañamiento técnico desde la ingeniería conceptual hasta la implementación.','Technical guidance from conceptual engineering through implementation.'],
    capabilities:[['Ingeniería conceptual','Conceptual Engineering'],['Selección de tecnología','Technology Selection'],['Suministro de tecnología','Technology Supply'],['Coordinación técnica','Technical Coordination'],['Implementación del proyecto','Project Implementation']]},
  {id:'consulting',code:'H',name:['Consultoría comercial','Commercial Consulting'],short:['Consultoría','Consulting'],zone:['Edificio corporativo · acceso','Corporate building · entrance'],index:7,sceneZone:'corporate',color:'#c46d35',
    summary:['Evaluación técnica personalizada para orientar los requerimientos de tu proyecto.','Personalized technical assessment to guide your project requirements.'],
    capabilities:[['Evaluación técnica personalizada','Personalized Technical Assessment'],['Consultoría técnica','Technical Consulting'],['Solicitud de consultoría','Consultation Request']],
    note:['El diagnóstico técnico inicial no tiene costo. Su confirmación depende del equipo comercial.','The initial technical assessment is free of charge. Confirmation depends on the commercial team.']}
];
export const categoryById = id => serviceCategories.find(category=>category.id===id);
export const categoryForService = index => categoryById(['datacenters','datacenters','power','connectivity','connectivity','security','datacenters','software'][index]);
export const categoryStop = category => ({index:category.index,category:category.id,sceneZone:category.sceneZone,production:!!category.production});
// Clockwise through the existing campus, starting at the entrance and ending nearby.
// Solutions and category-card arrows use this sequence. Numbered equipment and
// Explore solutions use the independent equipmentRoute in content.js.
export const serviceMapStops = ['security','consulting','engineering','cybersecurity','connectivity','datacenters','power','software'].map(id=>categoryStop(categoryById(id)));
export function nextRouteStep(current,direction,count=serviceMapStops.length){
  if(current<0)return direction>0?0:count-1;
  return (current+direction+count)%count;
}
export const additionalHotspots = [
  {category:'engineering',p:[-16.8,6.7,7]},
  {category:'consulting',p:[-18.2,1.8,10.8]},
  {category:'cybersecurity',p:[-8.5,7.8,-6.5]}
];

export function initializeServiceMap({getSelection,getLanguage,pauseTour,closeMenu}){
  const list=document.querySelector('#solutions-list');
  document.querySelector('#service-consultation').addEventListener('click',()=>{
    pauseTour();
    const {category,index,service}=getSelection();
    window.dispatchEvent(new CustomEvent('naitel:contact-open',{detail:{serviceId:service?.id||category?.id,serviceName:service?.name||category?.name[getLanguage()==='es'?0:1],contextType:service?'equipment':'category',contextIndex:index}}));
  });
  function select(category){
    for(const button of list.querySelectorAll('[data-category]')){
      if(button.dataset.category===category?.id)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    }
  }
  return {select,close:closeMenu};
}

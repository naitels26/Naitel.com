// Derive the deployment catalogue only from information already public on the site.
// Never copy private/assistant-catalog.txt into the repository or static output.
import {mkdir,writeFile} from 'node:fs/promises';
import {catalogServices,services} from '../content.js';
import {serviceCategories} from '../service-map.js';
const sections=[
  'NAITEL — Servicios publicados en la página. No prometer precios, fechas, certificaciones ni capacidades adicionales. El alcance se confirma con el equipo comercial.',
  ...catalogServices.map(service=>`${service.id.replace('catalog-','')}. ${service.name} / ${service.en}\n${service.summary}\n${service.summaryEn}`),
  'CATEGORÍAS OFICIALES',
  ...serviceCategories.map(category=>[category.name.join(' / '),...category.summary,...category.capabilities.map(pair=>pair.join(' / ')),...(category.note||[])].join('\n')),
  'EQUIPAMIENTO DEL RECORRIDO',
  ...services.map(service=>[service.name+' / '+service.en,service.description,service.descriptionEn,...service.features,...service.featuresEn].join('\n'))
];
await mkdir(new URL('../server-data/',import.meta.url),{recursive:true});
await writeFile(new URL('../server-data/assistant-catalog.txt',import.meta.url),sections.join('\n\n')+'\n','utf8');

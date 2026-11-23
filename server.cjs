// Servidor estático sin dependencias. Ejecutar: node server.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
try { process.loadEnvFile(path.join(root,'.env')); } catch(error) { if(error.code!=='ENOENT')throw error; }
const api=require('./api.cjs').createApi();
const publicFiles=new Set(['index.html','styles.css','app.js','content.js','brand.js','brands.js','cabling.js','scene.js','scene-details.js','model-loader.js','network-ui.js','contact.js','tour.js','tour-playback.mjs']);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.glb':'model/gltf-binary','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png'};
http.createServer((req,res)=>{
  let file;
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.startsWith('/api/')){api(req,res,pathname);return;}
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    const relative=pathname==='/'?'index.html':pathname.slice(1);
    if((!publicFiles.has(relative)&&!/^(assets|vendor)\/[a-zA-Z0-9_./ -]+$/.test(relative))||relative.split('/').some(s=>s.startsWith('.'))){res.writeHead(404).end();return;}
    file = path.resolve(root,relative);
  } catch { res.writeHead(400).end(); return; }
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if(file===root) file=path.join(root,'index.html');
  fs.stat(file,(error,stat)=>{
    if(error || !stat.isFile()){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':path.extname(file)==='.mjs'?'text/javascript; charset=utf-8':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('NAITEL — http://127.0.0.1:'+(Number(process.env.PORT)||4173)));

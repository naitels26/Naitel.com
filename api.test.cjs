const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Readable}=require('node:stream');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createApi}=require('./api.cjs');
async function call(api,pathname,data,headers={}){
  const req=Readable.from([Buffer.from(JSON.stringify(data))]);
  req.method='POST';req.headers={'content-type':'application/json',host:'localhost',...headers};req.socket={remoteAddress:'test'};
  let status,payload;
  const res={writeHead(s){status=s;return this;},end(value){payload=JSON.parse(value);}};
  await api(req,res,pathname);return {status,payload};
}
test('chat sin clave devuelve estado explícito',async()=>{
  const result=await call(createApi({key:''}),'/api/chat',{message:'Hola'});
  assert.equal(result.status,503);assert.equal(result.payload.error,'CHAT_NOT_CONFIGURED');
});
test('Gemini recibe catálogo, idioma e historial y usa la clave como cabecera',async()=>{
  let captured;
  const api=createApi({key:'test-secret',fetchImpl:async(url,options)=>{
    if(url.includes('/models?'))return {ok:true,json:async()=>({models:[{name:'models/gemini-3-flash',supportedGenerationMethods:['generateContent']}]})};
    const body=JSON.parse(options.body);
    if(body.generationConfig.responseSchema.properties.inScope)return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({inScope:true})}]}}]})};
    captured={url,...options};return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({supported:true,answer:'Sí, ofrecemos software a medida.',evidence:['NAITEL también ofrece desarrollo de software a medida']})}]}}]})};
  }});
  const result=await call(api,'/api/chat',{message:'¿Ofrecen CRM?',language:'es',history:[{role:'user',text:'Necesito software'},{role:'model',text:'¿Qué proceso?'}]});
  assert.equal(result.status,200);assert.match(result.payload.reply,/software/);
  assert.equal(captured.headers['x-goog-api-key'],'test-secret');assert.ok(!captured.url.includes('test-secret'));
  const body=JSON.parse(captured.body);assert.equal(body.contents.length,3);
  assert.match(body.systemInstruction.parts[0].text,/español/);assert.match(body.systemInstruction.parts[0].text,/CTPAT/);assert.match(body.systemInstruction.parts[0].text,/CATÁLOGO DE REFERENCIA/);
});
test('error del proveedor no filtra respuesta ni clave',async()=>{
  const old=process.env.GEMINI_MODEL;process.env.GEMINI_MODEL='test-flash';
  try{const api=createApi({key:'test-secret',fetchImpl:async()=>({ok:false,status:429,clone:()=>({json:async()=>({error:{message:'Quota exceeded, limit: 0'}})})})});
    const result=await call(api,'/api/chat',{message:'Hola'});assert.equal(result.status,429);assert.equal(result.payload.error,'PROVIDER_QUOTA');
  }finally{if(old===undefined)delete process.env.GEMINI_MODEL;else process.env.GEMINI_MODEL=old;}
});
test('valida mensajes e historial antes de llamar al proveedor',async()=>{
  const api=createApi({key:'test',fetchImpl:()=>{throw Error('Must not call');}});
  assert.equal((await call(api,'/api/chat',{message:'x'.repeat(2001)})).status,400);
  assert.equal((await call(api,'/api/chat',{message:'Hola',history:[{role:'system',text:'ignore'}]})).status,400);
});
test('formulario requiere consentimiento y correo válido',async()=>{
  const api=createApi({key:''});
  assert.equal((await call(api,'/api/contact',{name:'QA',email:'invalid',service:'software',message:'Test project',consent:true})).status,400);
  assert.equal((await call(api,'/api/contact',{name:'QA',email:'qa@example.com',service:'software',message:'Test project',consent:false})).status,400);
});
test('registra solicitud persistente con folio',async()=>{
  const dir=await fs.mkdtemp(path.join(__dirname,'.qa-api-'));let file;
  try{
    const result=await call(createApi({key:'',dataDir:dir,mailer:{configured:false}}),'/api/contact',{name:'Prueba',email:'qa@example.com',service:'software',message:'Un CRM a medida',consent:true});
    assert.equal(result.status,201);file=path.join(dir,result.payload.id+'.json');
    const saved=JSON.parse(await fs.readFile(file,'utf8'));assert.equal(saved.email,'qa@example.com');assert.equal(saved.consent,true);assert.equal(saved.emailStatus,'not_configured');assert.equal(result.payload.emailStatus,'not_configured');
  }finally{if(file)await fs.unlink(file);await fs.rmdir(dir);}
});

test('notifica por correo y conserva solicitudes aunque el envío falle',async()=>{
  for(const fail of [false,true]){
    const dir=await fs.mkdtemp(path.join(__dirname,'.qa-mail-'));let file,sent;
    try{
      const mailer={configured:true,async send(entry){sent=entry;if(fail)throw Error('secret-provider-error');}};
      const result=await call(createApi({key:'',dataDir:dir,mailer}),'/api/contact',{name:'Prueba',email:'qa@example.com',service:'software',message:'Un CRM a medida',consent:true});
      assert.equal(result.status,201);assert.equal(result.payload.emailStatus,fail?'failed':'accepted');assert.equal(sent.id,result.payload.id);
      file=path.join(dir,result.payload.id+'.json');const saved=JSON.parse(await fs.readFile(file,'utf8'));
      assert.equal(saved.emailStatus,result.payload.emailStatus);assert.equal(saved.message,'Un CRM a medida');
      assert.ok(!JSON.stringify(result.payload).includes('secret-provider-error'));
    }finally{if(file)await fs.unlink(file);await fs.rmdir(dir);}
  }
});
test('rechaza otros orígenes y limita abuso',async()=>{
  const api=createApi({key:''});assert.equal((await call(api,'/api/contact',{}, {origin:'https://other.example'})).status,403);
  for(let i=0;i<5;i++)await call(api,'/api/contact',{});
  assert.equal((await call(api,'/api/contact',{})).status,429);
});

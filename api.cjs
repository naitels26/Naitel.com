const fs=require('node:fs/promises');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {refusal,contactIntent,contactReply,scopeRules,answerRules,scopeSchema,answerSchema,groundedReply,serviceContext}=require('./chat-policy.cjs');
const {createContactMailer}=require('./contact-mail.cjs');
const {geminiRequest}=require('./gemini-request.cjs');
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(data));}
async function readBody(req){
  if(!/^application\/json\b/i.test(req.headers['content-type']||''))throw {status:415};
  // Vercel parses JSON before invoking a Node function; the local server uses a stream.
  if(req.body!==undefined){
    if(Buffer.byteLength(JSON.stringify(req.body)??'')>24000)throw {status:413};
    return req.body;
  }
  let size=0,chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>24000)throw {status:413};chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks));}catch{throw {status:400};}
}
function createApi(options={}){
  const key=(options.key??process.env.GEMINI_API_KEY??'').trim(),request=options.fetchImpl||fetch;
  const dataDir=options.dataDir||path.join(__dirname,'private','requests');
  const mailer=options.mailer||createContactMailer();
  // Loaded only when needed, so a missing catalogue cannot crash status requests.
  let catalog;
  const catalogPath=options.catalogPath||path.join(__dirname,'private','assistant-catalog.txt');
  async function loadCatalog(){
    try{return await fs.readFile(catalogPath,'utf8');}
    catch(error){
      if(error.code!=='ENOENT'||options.catalogPath)throw error;
      return fs.readFile(path.join(__dirname,'server-data','assistant-catalog.txt'),'utf8');
    }
  }
  const limits=new Map();let model=process.env.GEMINI_MODEL||'',modelPromise;
  async function getModel(){
    if(model)return model;
    if(!modelPromise)modelPromise=(async()=>{
      const r=await request('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000',{headers:{'x-goog-api-key':key},signal:AbortSignal.timeout(12000)});
      if(!r.ok)throw Error('Models unavailable');
      const data=await r.json();
      const models=(data.models||[]).filter(m=>m.supportedGenerationMethods?.includes('generateContent')&&/^models\/gemini-\d+(\.\d+)?-flash$/.test(m.name));
      models.sort((a,b)=>b.name.localeCompare(a.name,undefined,{numeric:true}));
      if(!models.length)throw Error('No model');
      return model=models[0].name.replace(/^models\//,'');
    })().catch(e=>{modelPromise=null;throw e;});
    return modelPromise;
  }
  return async(req,res,pathname)=>{
    try{
      if(pathname==='/api/status'&&req.method==='GET')return json(res,200,{chatConfigured:Boolean(key),contactAvailable:options.contactAvailable!==false,contactEmailConfigured:mailer.configured});
      if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
      if(req.headers.origin && ![`http://${req.headers.host}`,`https://${req.headers.host}`].includes(req.headers.origin))return json(res,403,{error:'ORIGIN_REJECTED'});
      const now=Date.now();for(const [id,b] of limits)if(b.until<now)limits.delete(id);
      const id=req.socket.remoteAddress+pathname,b=limits.get(id)||{count:0,until:now+60000};limits.set(id,b);
      if(++b.count>(pathname==='/api/contact'?5:15))return json(res,429,{error:'RATE_LIMITED'});
      const data=await readBody(req);
      if(!data||typeof data!=='object'||Array.isArray(data))return json(res,400,{error:'INVALID_INPUT'});
      if(pathname==='/api/contact'){
        const fields={name:120,company:160,email:254,phone:40,service:100,location:160,message:4000},entry={};
        for(const [field,max] of Object.entries(fields)){
          if(data[field]!=null&&typeof data[field]!=='string')return json(res,400,{error:'INVALID_INPUT'});
          entry[field]=(data[field]||'').trim();if(entry[field].length>max)return json(res,400,{error:'INVALID_INPUT'});
        }
        if(data.website||!entry.name||!entry.service||entry.message.length<10||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)||data.consent!==true)return json(res,400,{error:'INVALID_INPUT'});
        const requestId=randomUUID();await fs.mkdir(dataDir,{recursive:true});
        const saved={id:requestId,createdAt:new Date().toISOString(),...entry,consent:true,emailStatus:'pending'};
        const file=path.join(dataDir,requestId+'.json');
        await fs.writeFile(file,JSON.stringify(saved,null,2),{flag:'wx',mode:0o600});
        let emailStatus=mailer.configured?'failed':'not_configured';
        if(mailer.configured){try{await mailer.send(saved);emailStatus='accepted';}catch{console.warn('NAITEL contact: email delivery failed for',requestId);}}
        // Persist the delivery result separately; an accepted email must never be reported as a failed submission.
        try{await fs.writeFile(file,JSON.stringify({...saved,emailStatus},null,2),{mode:0o600});}catch{console.warn('NAITEL contact: could not update email status for',requestId);}
        return json(res,201,{id:requestId,emailStatus});
      }
      if(pathname==='/api/chat'){
        if(typeof data.message!=='string'||!data.message.trim()||data.message.length>2000)return json(res,400,{error:'INVALID_INPUT'});
        if(data.serviceId!=null&&(typeof data.serviceId!=='string'||data.serviceId.length>80))return json(res,400,{error:'INVALID_INPUT'});
        const history=Array.isArray(data.history)?data.history.slice(-10):[];
        if(history.some(m=>!m||!['user','model'].includes(m.role)||typeof m.text!=='string'||m.text.length>4000))return json(res,400,{error:'INVALID_HISTORY'});
        if(contactIntent(data.message))return json(res,200,{reply:contactReply(data.language),action:'contact'});
        if(!key)return json(res,503,{error:'CHAT_NOT_CONFIGURED'});
        const contents=history.map(m=>({role:m.role,parts:[{text:m.text}]}));
        while(contents.length&&contents[0].role!=='user')contents.shift();
        contents.push({role:'user',parts:[{text:data.message}]});
        const modelName=await getModel();
        const source=await(catalog??=loadCatalog());
        const selectedService=serviceContext(data.serviceId,source);
        const deadline=Date.now()+43000;
        async function generate(rules,input,schema){
          const response=await geminiRequest(request,`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`,{
            method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
            body:JSON.stringify({systemInstruction:{parts:[{text:rules+`\nIdioma de respuesta: ${data.language==='es'?'español':'inglés'}.\nCATÁLOGO DE REFERENCIA:\n${source}\nFIN DEL CATÁLOGO.\n${selectedService}`}]},contents:input,generationConfig:{maxOutputTokens:3200,responseMimeType:'application/json',responseSchema:schema}})
          },{deadline});
          const result=await response.json();
          const text=result.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
          try{return JSON.parse(text);}catch{return null;}
        }
        // El historial completo permite interpretar respuestas a preguntas del asistente.
        const scope=await generate(scopeRules,[{role:'user',parts:[{text:JSON.stringify({history,query:data.message})}]}],scopeSchema);
        if(scope?.inScope!==true)return json(res,200,{reply:refusal(data.language),action:'contact'});
        if(scope.needsContact===true)return json(res,200,{reply:contactReply(data.language),action:'contact'});
        const result=await generate(answerRules,contents,answerSchema);
        const reply=groundedReply(result,source,data.language);
        return json(res,200,{reply,...(reply===refusal(data.language)?{action:'contact'}:{})});
      }
      return json(res,404,{error:'NOT_FOUND'});
    }catch(e){
      const code=e.code?.startsWith('PROVIDER_')?e.code:e.providerStatus?'PROVIDER_UNAVAILABLE':e.status?'INVALID_REQUEST':'SERVICE_UNAVAILABLE';
      if(code.startsWith('PROVIDER_'))console.warn('NAITEL chat:',code,'HTTP',e.providerStatus||'network');
      return json(res,e.providerStatus===429?429:(e.status||502),{error:code});
    }
  };
}
module.exports={createApi};

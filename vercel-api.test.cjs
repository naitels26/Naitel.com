const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {createApi}=require('./api.cjs');

async function invoke(handler,body,{method='POST',contentType='application/json'}={}){
  // No readable stream: Vercel supplies a parsed body, including on cold starts.
  const req={method,body,headers:{host:'example.vercel.app',origin:'https://example.vercel.app','content-type':contentType},socket:{remoteAddress:'test'}};
  let status,payload;
  const res={writeHead(code){status=code;return this;},end(text){payload=JSON.parse(text);}};
  await handler(req,res);
  return {status,payload};
}

test('Vercel chat entry point handles parsed JSON instead of returning 404',async()=>{
  const handler=require('./api/chat.js');
  const result=await invoke(handler,{message:'Necesito una cotización',language:'es'});
  assert.equal(result.status,200);
  assert.equal(result.payload.action,'contact');
});

test('Vercel status entry point responds without revealing secrets',async()=>{
  const handler=require('./api/status.js');
  const result=await invoke(handler,undefined,{method:'GET'});
  assert.equal(result.status,200);
  assert.equal(result.payload.chatConfigured,Boolean(process.env.GEMINI_API_KEY?.trim()));
  assert.equal(result.payload.contactAvailable,false);
  assert.deepEqual(Object.keys(result.payload).sort(),['chatConfigured','contactAvailable','contactEmailConfigured']);
});

test('Vercel parsed requests keep size, input and origin validation',async()=>{
  const api=createApi({key:''});
  const handler=(req,res)=>api(req,res,'/api/chat');
  assert.equal((await invoke(handler,{message:'x'.repeat(25000)})).status,413);
  assert.equal((await invoke(handler,null)).status,400);
  assert.equal((await invoke(handler,{message:'Hola'},{contentType:'text/plain'})).status,415);
});

test('Vercel-style request reaches Gemini with the bundled catalogue and server key',async()=>{
  let calls=0;
  const api=createApi({key:'server-test-key',catalogPath:path.join(__dirname,'server-data','assistant-catalog.txt'),fetchImpl:async(url,options)=>{
    if(url.includes('/models?'))return {ok:true,json:async()=>({models:[{name:'models/gemini-3-flash',supportedGenerationMethods:['generateContent']}]})};
    calls++;
    assert.equal(options.headers['x-goog-api-key'],'server-test-key');
    const input=JSON.parse(options.body);
    assert.match(input.systemInstruction.parts[0].text,/CATÁLOGO DE REFERENCIA/);
    const output=input.generationConfig.responseSchema.properties.inScope?{inScope:true}:{supported:true,answer:'Ofrecemos desarrollo de software a medida.',evidence:['Desarrollo de software a medida']};
    return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(output)}]}}]})};
  }});
  const result=await invoke((req,res)=>api(req,res,'/api/chat'),{message:'¿Ofrecen software?',language:'es'});
  assert.equal(result.status,200);
  assert.match(result.payload.reply,/software/);
  assert.equal(calls,2);
});

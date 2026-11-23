const {test}=require('node:test');
const assert=require('node:assert/strict');
const {geminiRequest}=require('./gemini-request.cjs');
const failed=(status,message='')=>({ok:false,status,headers:{get:()=>null},clone:()=>({json:async()=>({error:{message}})})});
test('recupera una respuesta tras un 503 temporal',async()=>{
 let calls=0,delays=[];const success={ok:true};
 const result=await geminiRequest(async()=>++calls===1?failed(503):success,'https://example.test',{}, {wait:async ms=>delays.push(ms)});
 assert.equal(result,success);assert.equal(calls,2);assert.deepEqual(delays,[500]);
});
test('detiene reintentos al agotar el máximo y comunica alta demanda',async()=>{
 let calls=0;await assert.rejects(geminiRequest(async()=>{calls++;return failed(503);},'https://example.test',{}, {wait:async()=>{}}),e=>e.code==='PROVIDER_BUSY');assert.equal(calls,3);
});
test('no reintenta cuota agotada ni errores de credenciales',async()=>{
 for(const [status,message,code] of [[429,'Quota limit: 0','PROVIDER_QUOTA'],[403,'Access denied','PROVIDER_AUTH']]){
  let calls=0;await assert.rejects(geminiRequest(async()=>{calls++;return failed(status,message);},'https://example.test',{}, {wait:async()=>{throw Error('Unexpected retry')}}),e=>e.code===code);assert.equal(calls,1);
 }
});
test('no excede el tiempo total de respuesta',async()=>{
 await assert.rejects(geminiRequest(async()=>{throw Error('Must not call')},'https://example.test',{}, {deadline:Date.now()-1}),e=>e.code==='PROVIDER_TIMEOUT');
});

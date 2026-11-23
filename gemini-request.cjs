// Reintentos acotados: una interrupción del proveedor no se convierte en una respuesta inventada.
async function geminiRequest(request,url,options,{deadline=Date.now()+43000,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  let lastError={code:'PROVIDER_UNAVAILABLE'};
  for(let attempt=0;attempt<3;attempt++){
    const remaining=deadline-Date.now();
    if(remaining<1000)throw {code:'PROVIDER_TIMEOUT'};
    let response;
    try{response=await request(url,{...options,signal:AbortSignal.timeout(Math.min(12000,remaining))});}
    catch(error){
      lastError={code:['TimeoutError','AbortError'].includes(error.name)?'PROVIDER_TIMEOUT':'PROVIDER_UNAVAILABLE'};
      if(attempt<2){await wait(500*2**attempt);continue;}
      throw lastError;
    }
    if(response.ok)return response;
    const detail=await response.clone?.().json().catch(()=>null);
    const message=detail?.error?.message||'';
    const hardQuota=response.status===429&&(/limit:\s*0\b|billing|per day|prepay|credits/i.test(message));
    const code=response.status===429?'PROVIDER_QUOTA':[401,403].includes(response.status)?'PROVIDER_AUTH':response.status===503?'PROVIDER_BUSY':'PROVIDER_UNAVAILABLE';
    lastError={code,providerStatus:response.status};
    if(hardQuota||![408,429,500,502,503,504].includes(response.status)||attempt===2)throw lastError;
    const retryAfter=Number(response.headers?.get('retry-after'));
    const delay=Number.isFinite(retryAfter)&&retryAfter>0?retryAfter*1000:500*2**attempt;
    if(delay>3000||Date.now()+delay+1000>=deadline)throw lastError;
    await wait(delay);
  }
  throw lastError;
}
module.exports={geminiRequest};

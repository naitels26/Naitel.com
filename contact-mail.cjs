// Microsoft 365 credentials stay on the server. No external packages required.
const CONTACT_EMAIL='aleon@naitel.com';
function createContactMailer({env=process.env,fetchImpl=fetch}={}){
  const tenant=(env.M365_TENANT_ID||'').trim(),client=(env.M365_CLIENT_ID||'').trim();
  const secret=(env.M365_CLIENT_SECRET||'').trim(),sender=(env.M365_SENDER||CONTACT_EMAIL).trim();
  const configured=Boolean(tenant&&client&&secret&&sender);
  let token,expiresAt=0,tokenPromise;
  async function accessToken(){
    if(token&&Date.now()<expiresAt)return token;
    if(!tokenPromise)tokenPromise=(async()=>{
      const response=await fetchImpl(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`,{
        method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({client_id:client,client_secret:secret,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'}).toString(),
        signal:AbortSignal.timeout(8000)
      });
      if(!response.ok)throw Error('MAIL_AUTH_FAILED');
      const data=await response.json();
      if(typeof data.access_token!=='string'||!data.access_token)throw Error('MAIL_AUTH_FAILED');
      token=data.access_token;expiresAt=Date.now()+Math.max(0,(Number(data.expires_in)||0)-60)*1000;
      return token;
    })().finally(()=>{tokenPromise=null;});
    return tokenPromise;
  }
  return {configured,async send(entry){
    if(!configured)throw Error('MAIL_NOT_CONFIGURED');
    const bearer=await accessToken();
    const content=[`Nueva solicitud desde naitel.com`,`Folio: ${entry.id}`,`Fecha: ${entry.createdAt}`,'',
      `Nombre: ${entry.name}`,`Correo: ${entry.email}`,`Empresa: ${entry.company||'—'}`,`Teléfono: ${entry.phone||'—'}`,
      `Servicio: ${entry.service}`,`Ubicación: ${entry.location||'—'}`,'','Mensaje:',entry.message,'','Consentimiento de privacidad: aceptado.'].join('\n');
    const response=await fetchImpl(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,{
      method:'POST',headers:{Authorization:`Bearer ${bearer}`,'Content-Type':'application/json'},
      body:JSON.stringify({message:{subject:`NAITEL · Nueva solicitud · ${entry.id}`,body:{contentType:'Text',content},
        toRecipients:[{emailAddress:{address:CONTACT_EMAIL}}],replyTo:[{emailAddress:{address:entry.email}}]},saveToSentItems:true}),
      signal:AbortSignal.timeout(10000)
    });
    if(response.status===401){token=null;expiresAt=0;}
    if(response.status!==202)throw Error('MAIL_SEND_FAILED');
  }};
}
module.exports={createContactMailer,CONTACT_EMAIL};

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createContactMailer}=require('./contact-mail.cjs');
const env={M365_TENANT_ID:'test-tenant',M365_CLIENT_ID:'test-client',M365_CLIENT_SECRET:'test-secret'};
const entry={id:'folio-123',createdAt:'2026-11-23',name:'Ana',email:'visitor@example.com',service:'software',message:'Necesito un CRM <script>no HTML</script>'};
test('Microsoft 365 autentica en servidor y envía al destinatario fijo con Reply-To del visitante',async()=>{
  const calls=[];
  const mailer=createContactMailer({env,fetchImpl:async(url,options)=>{
    calls.push({url,...options});
    return url.includes('/token')?{ok:true,json:async()=>({access_token:'private-token',expires_in:3600})}:{status:202};
  }});
  assert.equal(mailer.configured,true);
  await mailer.send(entry);await mailer.send(entry);
  assert.equal(calls.length,3); // Cached access token, two separate notifications.
  const params=new URLSearchParams(calls[0].body);
  assert.equal(params.get('client_secret'),'test-secret');
  assert.equal(params.get('scope'),'https://graph.microsoft.com/.default');
  assert.match(calls[1].url,/users\/aleon%40naitel.com\/sendMail$/);
  const sent=JSON.parse(calls[1].body);
  assert.equal(sent.message.toRecipients[0].emailAddress.address,'aleon@naitel.com');
  assert.equal(sent.message.replyTo[0].emailAddress.address,entry.email);
  assert.equal(sent.message.body.contentType,'Text');assert.ok(sent.message.body.content.includes(entry.message));
  assert.equal(calls[1].headers.Authorization,'Bearer private-token');
});
test('credenciales faltantes o rechazo de Microsoft no se consideran envío exitoso',async()=>{
  const unconfigured=createContactMailer({env:{},fetchImpl:()=>{throw Error('Must not call');}});
  assert.equal(unconfigured.configured,false);await assert.rejects(unconfigured.send(entry),/MAIL_NOT_CONFIGURED/);
  const auth=createContactMailer({env,fetchImpl:async()=>({ok:false})});
  await assert.rejects(auth.send(entry),/MAIL_AUTH_FAILED/);
  const rejected=createContactMailer({env,fetchImpl:async url=>url.includes('/token')?{ok:true,json:async()=>({access_token:'token'})}:{status:403}});
  await assert.rejects(rejected.send(entry),/MAIL_SEND_FAILED/);
});

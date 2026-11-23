import {config} from './content.js';
import {renderPrivacyBlocks} from './network-ui.js';
export function initializeContact({t,getLanguage}){
  const dialog=document.querySelector('#contact-dialog'),form=document.querySelector('#contact-form');
  let previousFocus,sending=false;
  const submit=form.querySelector('[type=submit]'),consent=form.elements.consent;
  const updateSubmit=()=>{submit.disabled=sending||!consent.checked;};
  consent.addEventListener('change',updateSubmit);
  form.addEventListener('reset',()=>queueMicrotask(updateSubmit));
  updateSubmit();
  const select=form.elements.service;
  function open(serviceId){
    previousFocus=document.activeElement;
    if(!sending)document.querySelector('#contact-status').textContent='';
    if(serviceId)select.value=serviceId;
    if(!dialog.open)dialog.show();form.elements.name.focus({preventScroll:true});dialog.scrollTop=0;
  }
  document.querySelectorAll('[data-open-contact]').forEach(button=>button.addEventListener('click',()=>open()));
  window.addEventListener('naitel:contact-open',event=>open(event.detail?.serviceId));
  document.querySelector('#consultation').addEventListener('click',()=>open('consulting'));
  dialog.querySelector('.contact-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dialog.close();}});
  dialog.addEventListener('close',()=>previousFocus?.focus({preventScroll:true}));
  const privacy=document.querySelector('#contact-privacy'),privacyContent=document.querySelector('#contact-privacy-content');
  let loadedSource='',loading=false;
  async function loadInlinePrivacy(){
    if(!privacy.open||loading)return;
    const source=getLanguage()==='en'&&config.privacy.en?config.privacy.en:config.privacy.es;
    if(loadedSource===source)return;
    loading=true;privacyContent.textContent=t('privacyLoading');
    privacyContent.lang=source===config.privacy.en?'en':'es';
    try{
      const response=await fetch(source);if(!response.ok)throw Error('Privacy source');
      const document=await response.json();privacyContent.replaceChildren(renderPrivacyBlocks(document.blocks));loadedSource=source;
    }catch{privacyContent.textContent=t('contactPrivacyError');}
    finally{loading=false;}
  }
  privacy.addEventListener('toggle',loadInlinePrivacy);
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(sending||!consent.checked||!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent.checked;
    const status=document.querySelector('#contact-status');
    sending=true;submit.disabled=true;status.textContent=t('contactSending');
    try{
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(25000)});
      const result=await response.json();if(!response.ok)throw Error('Failed');
      form.reset();status.textContent=t(result.emailStatus==='accepted'?'contactSuccess':'contactSaved')+' '+result.id+(result.emailStatus==='accepted'?'':' '+t('contactEmailFallback'));
    }catch{status.textContent=t('contactError');}
    finally{sending=false;updateSubmit();}
  });
  return ()=>loadInlinePrivacy();
}

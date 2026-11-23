/* Marca automática para texto visible, incluidos cambios de idioma y chat.
   El título de pestaña y los atributos accesibles siguen siendo texto plano:
   los navegadores no permiten aplicar CSS a su propia interfaz. */
const excluded='script,style,textarea,input,select,option,title,noscript,svg,canvas,.brand';
export function applyBrandTypography(root=document.body){
  if(!root||root.nodeType!==1||root.closest(excluded))return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
    return node.parentElement?.closest(excluded)||!/\bnaitel\b/i.test(node.data)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
  }});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    const fragment=document.createDocumentFragment();let offset=0;
    for(const match of node.data.matchAll(/\bnaitel\b/gi)){
      fragment.append(document.createTextNode(node.data.slice(offset,match.index)));
      const span=document.createElement('span');span.className='brand';span.textContent=match[0];fragment.append(span);offset=match.index+match[0].length;
    }
    fragment.append(document.createTextNode(node.data.slice(offset)));node.replaceWith(fragment);
  }
}
export function observeBrandTypography(){
  applyBrandTypography();let scheduled=false;
  const observer=new MutationObserver(records=>{
    if(!records.some(r=>r.type==='characterData'||r.addedNodes.length)||scheduled)return;
    scheduled=true;queueMicrotask(()=>{scheduled=false;applyBrandTypography();});
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});return observer;
}


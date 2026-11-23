const fs=require('fs');const manifest=JSON.parse(fs.readFileSync('assets/brands/manifest.json'));
fs.writeFileSync('assets/brands/manifest.js','export default '+JSON.stringify(manifest,null,2)+';\n'+Object.keys(manifest).map(n=>'// FALTA SVG: '+n).join('\n')+'\n// FALTA SVG: Naitel\n');
let n=fs.readFileSync('network-ui.js','utf8');n="import {brandImage,preloadBrands} from './brands.js';\n"+n;n=n.replace('let manifest={};','preloadBrands();let manifest={};');let start=n.indexOf("      const port=document.createElement('span')"),end=n.indexOf('      track.append(port);',start);n=n.slice(0,start)+`      const port=brandImage(name);if(copy===0)port.tabIndex=0;else port.setAttribute('aria-hidden','true');\n`+n.slice(end);fs.writeFileSync('network-ui.js',n);
let a=fs.readFileSync('app.js','utf8');a="import {brandImage} from './brands.js';\n"+a;a=a.replace(/names.map\(name=>\{const el=document.createElement\('span'\);[\s\S]*?return el;\}\)/,'names.map(brandImage)');
const begin=a.indexOf('async function intro(){'),endIntro=a.indexOf('\n/* 04',begin);a=a.slice(0,begin)+`async function intro(){
 let seen=false;try{seen=sessionStorage.getItem('naitel-intro')==='1';sessionStorage.setItem('naitel-intro','1');}catch{}
 const overlay=$('.intro');let timeline,skipped=false;
 const finish=()=>{skipped=true;timeline?.kill();overlay?.remove();introFinished=true;typeTitle(false);document.removeEventListener('keydown',skip);};
 const skip=()=>finish();overlay?.addEventListener('click',skip);document.addEventListener('keydown',skip,{once:true});
 const deadline=setTimeout(finish,1800);
 if(seen||reduced){clearTimeout(deadline);finish();return;}
 await sceneReady;if(skipped)return;
 timeline=gsap.timeline({onComplete:()=>{clearTimeout(deadline);finish();}});
 timeline.to('.intro-cable',{scaleX:1,duration:.2}).to('.intro',{opacity:0,duration:.2});
 if(scene){const assembly=scene.intro();if(assembly){assembly.duration(.9);timeline.add(assembly,0);}}
}
`+a.slice(endIntro);
a=a.replace('applyMotionPreference();initializeNetworkUI();','initializeNetworkUI();');a=a.replace('setLanguage(language,{animate:false});return scene;',"setLanguage(language,{animate:false});requestAnimationFrame(()=>{performance.mark('naitel-first-frame');applyMotionPreference();});return scene;");a+="\ndocument.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause());else if(!reduced&&!paused)videos.filter(v=>v.classList.contains('is-visible')).forEach(v=>v.play().catch(()=>{}));});\n";fs.writeFileSync('app.js',a);
let h=fs.readFileSync('index.html','utf8').replace('</head>','<link rel="preload" href="assets/d3-euronism/D3Euronism.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="assets/naitel-official.png" as="image"></head>');h=h.replace('NAITEL © 2026','© Naitel 2026');fs.writeFileSync('index.html',h);

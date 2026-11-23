/* Cableado conceptual: capas independientes, escaladas en metros aproximados. */
export function buildCabling(parent,anim,E){
 const {THREE,M,box,cylinder,pipe}=E;anim.cableLayers=[];anim.cableFlows=[];
 const text=(g,value,x,y,z,w=.8)=>{const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#08243a';ctx.fillRect(0,0,256,64);ctx.font='bold 30px monospace';ctx.fillStyle='#79e5ff';ctx.fillText(value,10,43);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));mesh.position.set(x,y,z);g.add(mesh);return mesh;};
 const layer=(name,index)=>{const g=new THREE.Group();g.name=name;parent.add(g);anim.cableLayers.push({g,lift:index*.45});return g;};
 const tray=layer('Charola',0),copper=layer('Cat6A',1),patch=layer('Patch panel',2),fiber=layer('OS2',3),odf=layer('ODF',4);
 const aqua=M.cyan.clone(),yellow=M.orange.clone();yellow.color.set('#e8bd43');yellow.emissive.set('#8d7325');const blue=M.blue.clone();blue.color.set('#2477cf');blue.emissive.set('#104c9c');blue.emissiveIntensity=.35;
 // Dos charolas separadas y soportes; geometría repetida instanciada.
 for(const z of [-.8,.05]){for(const side of [-.19,.19])box(tray,6,.08,.035,0,2.8,z+side,M.silver);const steps=new THREE.InstancedMesh(new THREE.BoxGeometry(.045,.04,.42),M.silver,30);const matrix=new THREE.Matrix4();for(let i=0;i<30;i++)steps.setMatrixAt(i,matrix.makeTranslation(-2.9+i*.2,2.8,z));tray.add(steps);}
 for(const x of [-2.9,2.9]){pipe(tray,[[x,2.8,-.8],[x+.15,2.65,-.8],[x+.2,1,-.8],[x+.35,.7,-.8]],.045,M.silver);box(tray,.28,.28,.16,x+.2,1,-.8,M.white);}
 text(tray,'A / Cu',-1.7,3,-.52);text(tray,'B / FO',.8,3,.3);
 // Puesto de usuario, placa de dos jacks y cordón al terminal.
 box(tray,.65,1.5,.07,-3.7,.8,.65,M.white);box(copper,.22,.26,.04,-3.7,1.1,.71,M.white);
 for(const x of [-3.76,-3.64])box(copper,.07,.07,.03,x,1.12,.75,M.dark);
 box(tray,1.1,.07,.65,-3.7,.75,1.5,M.silver);box(tray,.58,.4,.04,-3.7,1.05,1.5,M.navy);
 pipe(copper,[[-3.7,1.1,.76],[-3.4,.82,1],[-3.65,.8,1.5]],.018,blue);
 // MDF: bastidor, patch panels, organizadores y jumpers numerados.
 for(const x of [2.35,3.45])box(tray,.07,2.4,.8,x,1.2,-.5,M.dark);
 box(tray,1.2,.08,.8,2.9,2.42,-.5,M.silver);
 for(let row=0;row<3;row++){box(patch,1.05,.14,.5,2.9,.9+row*.38,-.5,M.navy);box(patch,1,.07,.08,2.9,.76+row*.38,-.18,M.dark);for(let i=0;i<8;i++){const x=2.47+i*.12;box(patch,.07,.055,.025,x,.9+row*.38,-.23,M.silver);pipe(patch,[[x,.91+row*.38,-.2],[x,.72+row*.38,.02],[3.35,.7+row*.38,-.15]],.012,blue);}text(patch,'PP-0'+(row+1),2.9,1.02+row*.38,-.21,.55);}
 for(let i=0;i<6;i++){const z=-.95+i*.045;const p=pipe(copper,[[-3.7,1.1,.65],[-3.15,2.6,z],[-2.8,2.85,z],[2.8,2.85,z],[3.3,1.6,-.3]],.015,blue);const dot=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),new THREE.MeshBasicMaterial({color:'#64baff'}));copper.add(dot);anim.cableFlows.push({dot,curve:p.curve,speed:.13,phase:i/6});}
 for(let i=0;i<4;i++){const p=pipe(fiber,[[-2.7,.65,-.2],[-2.7,2.8,.05+i*.05],[0,2.85,.05+i*.05],[2.8,2.7,.05+i*.05],[2.9,2,-.15]],.012,i%2?aqua:yellow);const dot=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),new THREE.MeshBasicMaterial({color:'#b5ffff'}));fiber.add(dot);anim.cableFlows.push({dot,curve:p.curve,speed:.21,phase:i/4});}
 box(odf,1.1,.23,.65,2.9,2.05,-.5,M.white);for(let i=0;i<4;i++){box(odf,.21,.055,.35,2.5+i*.26,2.2,-.35,M.silver);for(let j=0;j<2;j++)box(odf,.035,.065,.07,2.48+i*.26+j*.055,2.05,-.13,aqua);}text(odf,'ODF / LC',2.9,2.3,-.12,.8);
 pipe(fiber,[[-2.7,.6,0],[-2.9,.2,-1],[-2.4,-.2,-1.7],[.5,-.2,-1.7]],.04,M.dark);box(tray,.6,.15,.6,.5,-.12,-1.7,M.silver);box(odf,.55,.3,.3,-2.7,.6,0,M.white);text(fiber,'MPO / OS2',-1.8,.25,-1,.9);
 // Herramientas: certificador, bobina y punch-down sobre mesa.
 box(tray,1.2,.07,.7,-1.5,.75,1.1,M.silver);for(const x of [-2,-1])box(tray,.055,.75,.055,x,.36,1.1,M.dark);
 box(patch,.23,.38,.09,-1.75,.95,1.1,M.orange);text(patch,'PASS',-1.75,1,1.16,.21);box(patch,.38,.035,.05,-1.2,.81,1.2,M.dark);box(patch,.16,.04,.07,-1.4,.82,1.2,M.orange);
 const spool=new THREE.Mesh(new THREE.TorusGeometry(.19,.07,8,20),blue);spool.position.set(-1.1,.9,.9);copper.add(spool);
 anim.cableCallouts=[];for(const [g,label,x,y,z] of [[copper,'Cat6A',0,3,-.7],[fiber,'OS2',1,2.9,.2],[odf,'ODF',2.9,2.4,-.1],[tray,'Charola',-2,2.9,-.4],[patch,'Certificación',-1.7,1.2,1.1]]){const tag=text(g,label,x,y+.45,z,.9);pipe(g,[[x,y,z],[x,y+.3,z],[x+.1,y+.35,z]],.008,aqua);anim.cableCallouts.push(tag);}
}
export function animateCabling(anim,time,mix){for(const {g,lift} of anim.cableLayers||[])g.position.y=mix*lift;for(const p of anim.cableFlows||[])p.dot.position.copy(p.curve.getPoint((time*p.speed+p.phase)%1));for(const tag of anim.cableCallouts||[])tag.visible=mix>.25;}

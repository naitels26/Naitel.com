import {buildCabling,animateCabling} from './cabling.js';
/* Equipos de catálogo, modelados de forma procedural y asociados a una zona.
   Los detalles finos se muestran al acercarse; no representan un plano ejecutivo. */
export function enrichService(index,g,a,E){
  const {THREE,M,box,cylinder,sphere,pipe,rod,SPACING}=E;
  const root=new THREE.Group();root.name='catalog-zone-'+index;g.add(root);
  const fine=new THREE.Group();fine.name='close-detail';root.add(fine);a.fine=fine;a.flow=[];a.waves=[];a.strobes=[];
  const code=(parent,text,x,y,z,width=1.2,vertical=false)=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const c=canvas.getContext('2d');c.font='32px monospace';c.fillStyle='#d77342';c.fillText(text,8,45);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));if(!vertical)m.rotation.x=-Math.PI/2;m.position.set(x,y,z);parent.add(m);return m;
  };
  const ports=(parent,x,y,z,count=6)=>{for(let n=0;n<count;n++){box(parent,.07,.06,.025,x+n*.12,y,z,M.dark);const led=box(parent,.025,.016,.025,x+n*.12,y+.065,z+.01,M.cyan);a.leds.push({mesh:led,phase:n+index});}};
  const flow=(points,mat,number=7)=>{const p=pipe(root,points,.008,mat);p.mesh.material=p.mesh.material.clone();p.mesh.material.transparent=true;p.mesh.material.opacity=.16;for(let n=0;n<number;n++){const dot=sphere(root,.035,0,0,0,mat);a.flow.push({dot,curve:p.curve,phase:n/number});}};
  if(index===0){
    // Plenum abierto, paneles levantados y cableado visible bajo piso.
    box(root,3,.035,1.65,-2.5,.05,4.7,M.dark);
    for(const x of [-3.6,-2.2]){const tile=box(root,1.2,.07,1.2,x,.62,4.7,M.silver);tile.rotation.x=-.24;for(const z of [4.2,5.2])cylinder(root,.035,.48,x,.27,z,M.silver);}
    for(let n=0;n<4;n++)pipe(root,[[-3.9,.13,4.1+n*.14],[-3.1,.18,4.4+n*.14],[-1.2,.12,4.1+n*.14]],.018,n%2?M.orange:M.cyan);
    for(let n=0;n<4;n++){box(fine,.8,.16,.02,(-2.45+n*1.65)*SPACING,.8,2.31+.73,M.dark);box(fine,.04,1.7,.05,(-2.45+n*1.65)*SPACING+.42,1.15,2.31+.75,M.orange);}
    box(fine,.035,.4,.045,-5.2,1.45,.25,M.silver);box(fine,.035,.4,.045,5.2,1.45,.25,M.silver);
    code(root,'A-01',-4,.08,5.7);code(root,'P-12',1.6,.08,3.6);
  }
  if(index===1){
    // InRow entre gabinetes, sensores y corrientes fría / caliente.
    for(const z of [-2.31,2.31]){
      box(root,.58,2.5,1.04,4.3,1.25,z,M.white);box(root,.48,1.9,.03,4.3,1.1,z+.54,M.navy);
      for(let n=0;n<7;n++)box(fine,.36,.03,.025,4.3,.45+n*.22,z+.57,M.silver);
      box(root,.23,.12,.025,4.3,2.29,z+.56,M.cyan);
      box(root,.14,.22,.08,2.7,2.35,z+.7,M.white);box(root,.08,.05,.015,2.7,2.4,z+.75,M.orange);
    }
    const warm=M.orange.clone();warm.emissive.set('#c2410c');warm.emissiveIntensity=.6;
    flow([[.5,.3,0],[3.2,.35,0],[7,.3,0]],M.cyan,9);
    flow([[7,2.85,3.6],[4,3.1,3.6],[.3,2.7,3.6]],warm,7);code(root,'TEMP / AIR',-.7,.08,2.3,1.5);
  }
  if(index===2){
    // Tablero, ATS y grupo electrógeno en una extensión exterior conectada.
    for(const x of [-3,-1.9]){box(root,.85,1.7,.52,x,.85,-2.1,M.white);box(root,.65,1.2,.025,x,.85,-1.82,M.navy);box(root,.17,.13,.02,x,1.36,-1.8,M.cyan);box(root,.15,.24,.025,x,.62,-1.79,M.orange);}
    box(root,5,.26,2.6,6,-.25,-2,M.dark);box(root,3.3,.16,2.7,7.2,-.06,-2,M.navy);
    box(root,2.6,1.17,1.6,7.3,.62,-2,M.white);box(root,2.66,.09,1.66,7.3,1.25,-2,M.orange);
    box(root,1.8,.7,.03,7.3,.65,-1.17,M.navy);for(let n=0;n<7;n++)box(fine,1.5,.025,.025,7.3,.37+n*.09,-1.13,M.silver);
    rod(root,[8.2,1.2,-2.5],[8.2,2.3,-2.5],.065,M.dark);rod(root,[8.2,2.3,-2.5],[8.6,2.3,-2.5],.065,M.dark);
    const tank=cylinder(root,.31,1.45,7.3,.35,-3.2,M.silver);tank.rotation.z=Math.PI/2;
    pipe(root,[[.4,.06,1.9],[3,.07,2],[6.6,.08,-.6]],.035,M.cyan);code(root,'ATS',-3.5,.08,-.7);code(root,'POWER / B',5.9,.08,-.6,1.8);
  }
  if(index===3)buildCabling(root,a,E);
  if(index===4){
    // Firewall, Wi-Fi y conexión WAN, sin atribuir velocidades ni licencias.
    box(root,1.55,.32,.85,2.1,.3,1.7,M.white);ports(fine,1.6,.31,2.15);
    const shape=new THREE.Shape();shape.moveTo(0,.48);shape.lineTo(.35,.3);shape.lineTo(.25,-.17);shape.lineTo(0,-.4);shape.lineTo(-.25,-.17);shape.lineTo(-.35,.3);shape.closePath();
    const shield=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false}),M.cyan);shield.position.set(2.1,1.15,1.75);root.add(shield);
    cylinder(root,.3,.09,6.5,3.8,4.7,M.white);
    for(let n=0;n<3;n++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.45+n*.22,.012,4,40),new THREE.MeshBasicMaterial({color:0x29b6f6,transparent:true,opacity:.2,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(6.5,3.9+n*.025,4.7);root.add(ring);a.waves.push({mesh:ring,phase:n*.7});}
    const cloud=new THREE.Group();cloud.position.set(-1.7,4.8,1.2);root.add(cloud);
    for(const [x,y,r] of [[-.5,0,.42],[0,.24,.6],[.6,0,.4]])sphere(cloud,r,x,y,0,M.white);box(cloud,1.7,.4,.6,0,-.1,0,M.white);
    rod(root,[-4,0,-1.1],[-4,5.4,-1.1],.045,M.silver);rod(root,[-4.4,5.05,-1.1],[-3.6,5.05,-1.1],.045,M.cyan);
    pipe(root,[[0,2.9,0],[-1,3.4,0],[-1.7,4.5,1.2]],.018,M.cyan);code(root,'VLAN 10',1.4,.08,3,1.6);code(cloud,'WAN',-.6,.1,.46,1.1,true);
  }
  if(index===5){
    // Pedestrian reader, cameras and voice paging share the main vehicle guardhouse.
    for(const x of [-.15,1.2])box(root,.055,2.25,.07,x,1.15,2.6,M.silver);
    box(root,1.4,.06,.07,.52,2.3,2.6,M.silver);box(root,1.15,2.12,.03,.52,1.15,2.6,M.glass);
    box(root,.13,.28,.07,1.31,1.15,2.6,M.navy);box(root,.07,.1,.025,1.31,1.18,2.65,M.cyan);box(fine,.07,.14,.06,.99,1.1,2.7,M.silver);
    rod(root,[2,0,-1.5],[2,3.35,-1.5],.04,M.silver);box(root,.65,.26,.27,2,3.22,-1.2,M.white);sphere(root,.08,2,3.2,-1.04,M.dark);
    cylinder(root,.24,.22,-1,3.5,1.1,M.white);sphere(root,.21,-1,3.32,1.1,M.dark);
    const horn=new THREE.Mesh(new THREE.ConeGeometry(.22,.35,16),M.white);horn.rotation.x=Math.PI/2;horn.position.set(2,2.7,-1.25);root.add(horn);
    code(root,'ACCESS / A',2.5,.08,3.1,1.9);
  }
  if(index===6){
    // Detectores sobre pasillos y señal estroboscópica en el panel.
    for(const x of [-4,-.4,3.2])for(const z of [-1.2,1.2]){cylinder(root,.14,.08,(x-7.5)*SPACING,3.72,(z-2.3)*SPACING,M.white);sphere(fine,.025,(x-7.5)*SPACING,3.67,(z-2.3)*SPACING,M.orange);}
    const flashMaterial=M.orange.clone();flashMaterial.emissive.set('#ef5e2a');flashMaterial.emissiveIntensity=.3;
    const flash=sphere(root,.11,1.8,1.51,-.6,flashMaterial);a.strobes.push(flash);
    box(root,.4,.5,.13,2.6,1,-.7,M.white);box(root,.19,.19,.03,2.6,1,-.62,M.orange);
    code(root,'FIRE / 01',-.8,.08,1.3,1.6);
  }
  if(index===7){
    // Blades, NAS/SAN y pantalla DCIM con gráfico ilustrativo actualizado.
    box(root,1.08,1.85,.95,-3.6,.94,1.4,M.navy);
    for(let n=0;n<6;n++){box(root,.9,.19,.025,-3.6,.25+n*.27,1.9,M.silver);const led=box(root,.04,.03,.02,-3.25,.28+n*.27,1.93,M.cyan);a.leds.push({mesh:led,phase:n});}
    box(root,1.25,.7,.75,-2.1,.4,-.15,M.white);
    for(let n=0;n<4;n++){box(root,.22,.5,.025,-2.5+n*.27,.42,.24,M.dark);box(fine,.04,.04,.02,-2.5+n*.27,.25,.27,M.green);}
    box(root,.1,1.2,.12,2.5,.8,-.25,M.silver);box(root,2.2,1.3,.12,2.5,1.95,-.25,M.navy);
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=224;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const display=new THREE.Mesh(new THREE.PlaneGeometry(2.02,1.12),new THREE.MeshBasicMaterial({map:texture}));display.position.set(2.5,1.95,-.17);root.add(display);a.dashboard={canvas,texture,last:-1};
    code(root,'ERP / CRM',.3,.08,1.3,1.6);code(root,'NAS / BACKUP',-3,.08,2.5,2);
  }
}
export function animateServiceDetails(o,time,focused){
  const a=o.anim;animateCabling(a,time,o.focus.mix);if(a.fine)a.fine.visible=focused;
  for(const p of a.flow||[]){const v=(time*.15+p.phase)%1;p.dot.position.copy(p.curve.getPoint(.5-.5*Math.cos(v*Math.PI)));}
  for(const wave of a.waves||[]){const v=.5+.5*Math.sin(time*.9+wave.phase);wave.mesh.scale.setScalar(.85+v*.25);wave.mesh.material.opacity=.06+v*.15;}
  for(const light of a.strobes||[])light.material.emissiveIntensity=.2+Math.pow(.5+.5*Math.sin(time*2),5)*1.4;
  if(a.dashboard&&time-a.dashboard.last>.35){
    const {canvas,texture}=a.dashboard,c=canvas.getContext('2d');c.fillStyle='#0a2036';c.fillRect(0,0,384,224);c.fillStyle='#8faec2';c.font='15px monospace';c.fillText('DCIM / OPERATIONS',18,26);
    c.strokeStyle='#1b4059';for(let i=0;i<5;i++){c.beginPath();c.moveTo(18,60+i*30);c.lineTo(366,60+i*30);c.stroke();}
    c.strokeStyle='#29b6f6';c.lineWidth=3;c.beginPath();for(let x=0;x<330;x+=8){const y=100+Math.sin(x*.025+time*.5)*23+Math.sin(x*.07)*7;if(x)c.lineTo(25+x,y);else c.moveTo(25+x,y);}c.stroke();
    c.fillStyle='#c96738';for(let i=0;i<7;i++)c.fillRect(28+i*47,185-(18+Math.sin(i+time*.3)*11),23,18+Math.sin(i+time*.3)*11);
    c.fillStyle='#d6e5ed';c.font='12px monospace';c.fillText('ERP  /  CRM  /  CHECKLIST',18,216);texture.needsUpdate=true;a.dashboard.last=time;
  }
}


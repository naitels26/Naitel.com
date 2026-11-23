import {accessCycle} from './assets/operation-cycle.mjs';
import {RoundedBoxGeometry} from './vendor/three-addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from './vendor/three-addons/environments/RoomEnvironment.js';
import * as THREE from './vendor/three.module.js';
import { services } from './content.js';

/* 01 — Geometrías compartidas. Todo el equipamiento es procedural. */
const BOX = new RoundedBoxGeometry(1,1,1,1,.025);
const CYL = new THREE.CylinderGeometry(1,1,1,20);
const SPHERE = new THREE.SphereGeometry(1,20,12);
const UP = new THREE.Vector3(0,1,0);
const MATERIAL_GRAY = new THREE.Color();
const SPACING = 1.4;
// Adjustable overview only; service close-ups keep their approved framing.
const OVERVIEW = {scale:1.75,distanceScale:.92,fov:42,zoom:2.071875,dollyDuration:1.5,ease:'power2.inOut'};
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
const idleTask=()=>new Promise(resolve=>{
  if('requestIdleCallback' in window)requestIdleCallback(resolve,{timeout:1200});
  else setTimeout(resolve,32);
});
const tubeGeometries=new Map();
const M = {};
const material = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.2,...extra});
M.white=material('#f5f7fc',{roughness:.7,metalness:.05});M.navy=material('#18385d');M.dark=material('#0a1d32',{roughness:.83,metalness:.08});M.silver=material('#b8c8d5',{metalness:.55});M.blue=material('#517897');M.orange=material('#c95b2d');M.cyan=material('#52d9fa',{emissive:'#29b6f6',emissiveIntensity:1.3});M.green=material('#83ebca',{emissive:'#5ff2b3',emissiveIntensity:1});M.screen=material('#102e4d',{roughness:.2,metalness:.35});
function box(parent,w,h,d,x,y,z,mat=M.white){if(parent.userData.layout){w*=SPACING;d*=SPACING;x*=SPACING;z*=SPACING;}const mesh=new THREE.Mesh(BOX,mat);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function cylinder(parent,r,h,x,y,z,mat=M.silver){const mesh=new THREE.Mesh(CYL,mat);mesh.scale.set(r,h,r);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
function sphere(parent,r,x,y,z,mat=M.white){const mesh=new THREE.Mesh(SPHERE,mat);mesh.scale.setScalar(r);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
function pipe(parent,points,r=.025,mat=M.cyan){
  const vectors=points.map(p=>new THREE.Vector3(...p)),origin=vectors[0];
  const local=vectors.map(p=>p.clone().sub(origin));
  const key=r+':'+local.map(p=>p.toArray().map(v=>v.toFixed(5)).join(',')).join(';');
  if(!tubeGeometries.has(key))tubeGeometries.set(key,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(local),40,r,6,false));
  const mesh=new THREE.Mesh(tubeGeometries.get(key),mat);mesh.position.copy(origin);mesh.userData.pipeOrigin=origin.clone();mesh.castShadow=true;parent.add(mesh);
  return {mesh,curve:new THREE.CatmullRomCurve3(vectors)};
}
function rod(parent,a,b,r,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const m=cylinder(parent,r,v.length(),...av.clone().add(bv).multiplyScalar(.5).toArray(),mat);m.quaternion.setFromUnitVectors(UP,v.normalize());return m;}
function vent(parent,x,y,z,w=.5,rows=8){for(let i=0;i<rows;i++)box(parent,w,.025,.025,x,y+i*.085,z,M.dark);}

/* 02 — Un solo site: pasillos, servicios perimetrales y recorridos compartidos. */
M.floor=material('#12243a',{roughness:.55,metalness:.25});
M.glass=material('#79cfea',{transparent:true,opacity:.14,roughness:.15,metalness:0,depthWrite:false,side:THREE.DoubleSide});
const perforation=document.createElement('canvas');perforation.width=128;perforation.height=256;
const pc=perforation.getContext('2d');pc.fillStyle='#31546e';pc.fillRect(0,0,128,256);
pc.fillStyle='#071522';for(let x=5;x<128;x+=9)for(let y=5;y<256;y+=9){pc.beginPath();pc.arc(x,y,2.6,0,Math.PI*2);pc.fill();}
const doorTexture=new THREE.CanvasTexture(perforation);doorTexture.colorSpace=THREE.SRGBColorSpace;
M.door=material('#9caebc',{map:doorTexture,roughness:.75});
function rack(parent,anim,x,z,rotation=0,mdf=false){
  const r=new THREE.Group();r.position.set(x*SPACING,0,z*SPACING);r.rotation.y=rotation;parent.add(r);
  box(r,1.05,2.6,1.18,0,1.3,0,M.navy);box(r,.96,2.42,.04,0,1.31,.61,M.dark);
  for(let j=0;j<8;j++){
    box(r,.82,.19,.04,0,.34+j*.265,.65,mdf?M.silver:M.blue);
    if(mdf)for(let k=0;k<6;k++)box(r,.07,.05,.02,-.31+k*.125,.35+j*.265,.68,M.dark);
    const led=box(r,.035,.035,.025,.43,.36+j*.265,.72,M.cyan);anim.leds.push({mesh:led,phase:j+x});
  }
  // Puerta perforada, bisagras y PDU vertical en la cara posterior.
  const hinge=new THREE.Group();hinge.position.set(-.405,0,.703);r.add(hinge);
  box(hinge,.76,2.23,.025,.38,1.31,0,M.door);box(hinge,.035,.27,.04,.77,1.3,.02,M.silver);
  (anim.doors||=[]).push(hinge);
  box(r,.78,2.23,.025,-.08,1.31,-.703,M.door);
  box(r,.1,2.22,.06,.36,1.3,-.64,M.dark);
  for(let j=0;j<7;j++)box(r,.055,.075,.02,.36,.5+j*.26,-.68,M.orange);
  box(r,1.08,.07,1.2,0,2.64,0,M.silver);box(r,.75,.025,.75,0,2.69,0,M.dark);
  return r;
}
function worldRoute(g,s,points,r=.025,mat=M.cyan){return pipe(g,points.map(([x,y,z])=>[(x-s.position[0])*SPACING,y,(z-s.position[1])*SPACING]),r,mat);}
const builders=[
  (g,a)=>{
    g.userData.layout=true;
    for(const z of [-1.65,1.65])for(let i=0;i<4;i++)rack(g,a,-2.45+i*1.65,z,z<0?0:Math.PI);
    // Pasillo frío central; pasillos calientes abiertos en el exterior.
    box(g,7.25,.025,1.84,0,.035,0,material('#143c54',{emissive:'#29b6f6',emissiveIntensity:.16}));
    for(const z of [-.86,.86])box(g,7.4,.018,.035,0,.06,z,M.cyan);
    for(const x of [-3.75,3.75]){
      for(const z of [-1,1])box(g,.045,3.05,.045,x,1.53,z,M.silver);
      box(g,.055,2.95,1.9,x,1.52,0,M.glass);box(g,.1,.07,2.1,x,3.08,0,M.silver);
    }
    for(let i=0;i<4;i++){box(g,1.74,.035,1.95,-2.65+i*1.78,3.06,0,M.glass);box(g,.025,.055,2,-3.5+i*1.78,3.1,0,M.silver);}
    for(const z of [-3,3])for(let x=-3;x<4;x+=.42)box(g,.23,.01,.04,x,.055,z,M.orange);
  },
  (g,a)=>{
    for(const z of [-.95,.95].map(v=>v*SPACING)){
      box(g,.85,2.6,1.02,0,1.3,z);box(g,.72,1.7,.035,0,1.05,z+.53,M.navy);
      vent(g,0,.32,z+.56,.58,17);box(g,.5,.25,.03,0,2.23,z+.53,M.dark);box(g,.29,.11,.02,0,2.25,z+.55,M.cyan);
      for(let j=0;j<3;j++){const air=pipe(g,[[.43,.35,z-.35+j*.3],[1,.6,z-.3+j*.3],[1.7,.4,z-.3+j*.3]],.018,M.cyan);a.air.push(air.mesh);}
    }
  },
  (g)=>{
    for(let i=0;i<2;i++){
      box(g,1.05,2.25,1.15,(-.65+i*1.25)*SPACING,1.125,0,M.navy);box(g,.88,.42,.035,(-.65+i*1.25)*SPACING,1.92,.6,M.dark);
      box(g,.42,.16,.02,(-.65+i*1.25)*SPACING,1.94,.63,M.cyan);vent(g,(-.65+i*1.25)*SPACING,.3,.6,.76,15);
    }
    for(let i=0;i<4;i++){box(g,.42,.65,.65,-.8+i*.55,.35,1.45,M.dark);box(g,.44,.05,.67,-.8+i*.55,.7,1.45,M.silver);box(g,.06,.03,.02,-.7+i*.55,.72,1.79,M.orange);}
    box(g,2.6,.75,1.2,0,.4,-1.7,M.white);box(g,2.65,.08,1.25,0,.82,-1.7,M.orange);
    vent(g,0,.18,-1.06,1.9,6);cylinder(g,.07,.45,.92,1.08,-1.85,M.dark);
  },
  (g,a,s)=>{
    // Independent bridge linking production to the data center.
    for(const z of [-.35,.35])pipe(g,[[-7,3.8,z],[0,3.8,z],[8,3.8,z]],.045,M.silver);
    for(let x=-7;x<=8;x+=.55)box(g,.06,.06,.75,x,3.76,0,M.silver);
    for(let j=0;j<5;j++)a.fibers.push(pipe(g,[[-9,1.2,j*.1-.2],[-7,3.85,j*.1-.2],[7,3.85,j*.1-.2],[9,2.6,j*.1-.2]],.025,j%2?M.orange:M.cyan));
    for(const x of [-7,7])rod(g,[x,.1,0],[x,3.75,0],.06,M.silver);
  },
  (g,a)=>{
    rack(g,a,-.65,0,0,true);rack(g,a,.65,0,0,true);
    for(let i=0;i<6;i++)pipe(g,[[-.95+i*.17,.5,.78],[-1.1+i*.17,1,.9],[-.95+i*.17,1.8,.78]],.012,i%2?M.cyan:M.orange);
    box(g,2.7,.08,1.5,0,.04,0,M.dark);
  },
  (g,a)=>{
    cylinder(g,.045,3.5,-1.3,1.75,-.9,M.silver);box(g,.7,.07,.3,-1.05,3.48,-.9);
    const dome=new THREE.Group();dome.position.set(-.7,3.35,-.9);g.add(dome);cylinder(dome,.23,.12,0,0,0);sphere(dome,.2,0,-.1,0,M.dark);sphere(dome,.06,.05,-.1,.18,M.cyan);a.dome=dome;
    box(g,.45,1.15,.2,1.3,.58,.5,M.navy);box(g,.3,.23,.02,1.3,1,.61,M.cyan);
  },
  (g,a,s)=>{
    // Cilindros en zona de servicio; colector y ramales de supresión sobre los pasillos.
    for(let i=0;i<4;i++){
      const x=(-.95+i*.62)*SPACING;cylinder(g,.23,1.8,x,.95,0,M.orange);sphere(g,.23,x,1.85,0,M.orange);
      cylinder(g,.045,.2,x,2.08,0,M.silver);box(g,.22,.04,.045,x,2.21,0,M.navy);
      rod(g,[x,2.2,0],[x,2.65,0],.035,M.silver);box(g,.3,.055,.02,x,1.15,.235);
    }
    rod(g,[-1.1*SPACING,2.65,0],[1.1*SPACING,2.65,0],.04,M.silver);
    pipe(g,[[0,2.65,0],[0,3.95,0],[-7,3.95,0]],.035,M.orange);
    for(const x of [-2,-5]){pipe(g,[[x,3.95,0],[x,3.95,2.5]],.028,M.orange);cylinder(g,.08,.1,x,3.87,2.5,M.silver);}
    box(g,.62,.9,.18,1.8,.9,-.7);box(g,.4,.32,.02,1.8,1.06,-.59,M.dark);box(g,.19,.05,.01,1.8,1.08,-.57,M.cyan);
  },
  (g)=>{
    // Puesto de operación conectado al site.
    box(g,3,.12,1.12,0,1.03,0,M.silver);
    for(const x of [-1.3,1.3])box(g,.1,1,.8,x,.5,0,M.navy);
    for(const x of [-.72,.72]){
      box(g,.1,.45,.1,x,1.29,-.15,M.silver);box(g,1.3,.83,.1,x,1.8,-.2,M.navy);box(g,1.18,.7,.02,x,1.8,-.14,M.screen);
      for(let i=0;i<4;i++)box(g,.8,.026,.01,x,1.97-i*.12,-.12,i===0?M.cyan:M.silver);
    }
    box(g,1.15,.035,.32,0,1.12,.26,M.dark);
  }
];

export class InfrastructureScene {
  static async create(container,options={}){
    // Let the lightweight HTML loader paint before allocating WebGL resources.
    await nextFrame();
    const scene=new InfrastructureScene(container,options);
    try{await scene.initialize(options.onProgress||(()=>{}));return scene;}
    catch(error){scene.renderer.dispose();scene.renderer.domElement.remove();throw error;}
  }
  constructor(container,{onSelect,onHover,reduced=false}={}){
    this.container=container;this.onSelect=onSelect;this.onHover=onHover;this.reduced=reduced;this.paused=reduced;this.selected=-1;this.hovered=-1;this.objects=[];this.paths=[];this.pickables=[];this.clock=new THREE.Clock();this.time=0;this.pointer=new THREE.Vector2(-10,-10);this.parallax={x:0,y:0};this.lowPower=(navigator.hardwareConcurrency||8)<=4 || (navigator.deviceMemory||8)<=4;this.raycaster=new THREE.Raycaster();this.lookAt=new THREE.Vector3(0,0,0);this.cameraState={x:21,y:23,z:27,tx:0,ty:0,tz:0,fov:34};
    this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.lowPower?1:1.5));this.renderer.shadowMap.enabled=false;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.setClearColor(0x000000,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;container.prepend(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(34,1,.1,600);this.world=new THREE.Group();this.scene.add(this.world);this.ambient=new THREE.HemisphereLight(0xebf6ff,0x8a9cb3,2.7);this.scene.add(this.ambient);this.key=new THREE.DirectionalLight(0xfff7ed,4.4);this.key.position.set(-8,15,8);this.key.castShadow=false;this.key.shadow.mapSize.set(2048,2048);Object.assign(this.key.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:75});this.key.shadow.bias=-.0005;this.key.shadow.normalBias=.035;this.key.shadow.radius=4;this.scene.add(this.key);this.fill=new THREE.DirectionalLight(0x83d8ff,1.5);this.fill.position.set(8,7,-9);this.scene.add(this.fill);
    // Keep one focus light in the initial shader configuration: selection does not add lights.
    this.focusLight=new THREE.SpotLight(0x29b6f6,0,18,Math.PI/7,.65,1);this.focusLight.position.set(0,10,0);this.focusLight.target=this.world;this.world.add(this.focusLight);
  }
  async initialize(onProgress){
    this.key.shadow.mapSize.set(1024,1024);
    onProgress(12);await nextFrame();this.buildPlatform();this.instanceStatic(this.platform,{});
    onProgress(22);await nextFrame();await this.buildServices(onProgress);
    this.buildAmbientZones();this.buildContactShadows();this.buildConnections();this.buildZoneLabels();this.setupFocusRenderer();onProgress(76);await nextFrame();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.container);this.resize();this.bind();
    onProgress(82);await this.renderer.compileAsync(this.scene,this.camera);await nextFrame();
    this.applyCamera();this.renderer.shadowMap.needsUpdate=true;this.renderer.render(this.scene,this.camera);
    onProgress(96);await nextFrame();this.running=!document.hidden;this.loop();
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){cancelAnimationFrame(this.frameRequest);this.running=false;this.clock.stop();this.container.dataset.renderState='suspended';}
      else if(!this.running){this.running=true;this.clock.start();this.container.dataset.renderState='running';this.loop();}
    });
    this.container.dataset.renderState=this.running?'running':'suspended';
    document.documentElement.dataset.firstFrameMs=Math.round(performance.now());
    this.publishCamera();onProgress(100);
  }
  applyCamera(){
    const s=this.cameraState;this.camera.position.set(s.x,s.y,s.z);this.camera.lookAt(s.tx,s.ty,s.tz);this.camera.fov=s.fov;this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  }
  publishCamera(){
    this.container.dataset.overviewCamera=JSON.stringify({...this.home,zoom:this.camera.zoom,scale:OVERVIEW.scale,distanceScale:OVERVIEW.distanceScale,dollyDuration:OVERVIEW.dollyDuration});
  }
  async startDeferred(){
    if(this.deferredStarted)return;this.deferredStarted=true;
    // Keep expensive work outside the first three seconds of visible animation.
    await new Promise(resolve=>setTimeout(resolve,1500));
    const details=await import('./scene-details.js');this.animateDetails=details.animateServiceDetails;
    const order=[...services.keys()].sort((a,b)=>(a===this.selected?-1:b===this.selected?1:0));
    for(const index of order){
      await idleTask();await this.whenVisible();
      const o=this.objects[index];if(o.modelLoaded)continue;
      const previous=new Set(o.equipment.children);
      if(index!==3)details.enrichService(index,o.equipment,o.anim,{THREE,M,box,cylinder,sphere,pipe,rod,SPACING});
      for(const child of o.equipment.children){
        if(previous.has(child))continue;
        this.instanceLEDs(child,o.anim);this.instanceStatic(child,o.anim);this.preparePart(child,o.equipment.children.indexOf(child));
        this.prepareMaterials(child,o,index);
      }
      this.updateMaterials(o);this.renderer.shadowMap.needsUpdate=true;
      await this.renderer.compileAsync(this.scene,this.camera);
      this.container.dataset.detailsLoaded=String(Number(this.container.dataset.detailsLoaded||0)+1);
    }
    await idleTask();await this.whenVisible();this.buildParticles();
    if(!this.lowPower){
      await idleTask();await this.whenVisible();const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(this.renderer);
      this.environmentTarget=pmrem.fromScene(room,.025);this.scene.environment=this.environmentTarget.texture;this.scene.environmentIntensity=.3;room.dispose();pmrem.dispose();
    }
    // GLB/Draco/KTX2 downloads are serial and keep procedural equipment on error.
    for(const index of order){const s=services[index];if(!s.modelUrl)continue;await idleTask();await this.whenVisible();
      try{const m=await import('./model-loader.js');await m.loadEquipment(this,index,s.modelUrl);}catch(error){console.warn('Model fallback',s.id,error);}
    }
    this.container.dataset.deferredReady='true';
  }
  whenVisible(){
    if(!document.hidden)return Promise.resolve();
    return new Promise(resolve=>{const visible=()=>{if(!document.hidden){document.removeEventListener('visibilitychange',visible);resolve();}};document.addEventListener('visibilitychange',visible);});
  }
  preparePart(part,index){part.userData.base=part.position.clone();part.userData.explode=new THREE.Vector3();}
  prepareMaterials(root,o,index){
    const materials=new Map();root.traverse(mesh=>{
      if(!mesh.isMesh)return;mesh.userData.service=index;if(index===3)mesh.userData.zone=true;this.pickables.push(mesh);
      const convert=source=>{if(!materials.has(source.uuid)){const m=source.clone();m.userData.baseOpacity=m.opacity;m.userData.baseColor=m.color.clone();m.userData.baseEmissive=m.emissiveIntensity||0;materials.set(source.uuid,m);}return materials.get(source.uuid);};
      mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);
    });o.materials.push(...materials.values());
  }

  buildDataCenter(g){
    const shell=new THREE.Group();shell.userData.structure=true;g.add(shell);
    box(shell,14,.15,11,0,.01,0,M.silver);
    box(shell,14,4.7,.15,0,2.35,-5.5,M.white);
    for(const x of [-7,7]){box(shell,.16,4.7,11,x,2.35,0,M.glass);box(shell,.18,4.9,.18,x,2.45,5.5,M.silver);}
    box(shell,14,.18,1.5,0,4.8,-4.8,M.navy);
  }
  setupFocusRenderer(){
    this.focusEffect={amount:0};this.focusMembers=[];
    this.backgroundTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});
    this.blurScene=new THREE.Scene();this.blurCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.blurMaterial=new THREE.ShaderMaterial({
      uniforms:{image:{value:this.backgroundTarget.texture},pixel:{value:new THREE.Vector2(1,1)},amount:{value:0}},
      depthTest:false,depthWrite:false,transparent:false,
      vertexShader:'varying vec2 uvOut; void main(){uvOut=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader:`uniform sampler2D image;uniform vec2 pixel;uniform float amount;varying vec2 uvOut;
        void main(){
          vec4 c=vec4(0.0);float total=0.0;
          for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++){
            float weight=exp(-float(x*x+y*y)/3.0);
            c+=texture2D(image,uvOut+vec2(float(x),float(y))*pixel*amount*2.0)*weight;total+=weight;
          }
          c/=total;
          gl_FragColor=vec4(c.rgb*(1.0-amount*.42),c.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    });
    this.blurScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.blurMaterial));
  }
  renderScene(){
    const amount=this.focusEffect?.amount||0;
    if(amount<.002||!this.focusMembers.length){this.renderer.render(this.scene,this.camera);return;}
    const foreground=this.selected===7&&!this.selectionOptions?.production?[]:this.focusMembers.map(i=>this.objects[i].group);
    if(this.selected===7&&!this.selectionOptions?.production)foreground.push(this.softwareOffice);
    // Both passes use the same camera and world transforms: the place stays connected.
    for(const group of foreground)group.visible=false;
    this.renderer.setRenderTarget(this.backgroundTarget);this.renderer.render(this.scene,this.camera);
    for(const group of foreground)group.visible=true;
    this.renderer.setRenderTarget(null);this.blurMaterial.uniforms.amount.value=amount;
    this.renderer.render(this.blurScene,this.blurCamera);
    const visibility=this.world.children.map(child=>[child,child.visible]);
    for(const child of this.world.children)if(!foreground.includes(child)&&!child.isLight)child.visible=false;
    const outside=this.scene.children.filter(child=>child!==this.world&&!child.isLight).map(child=>[child,child.visible]);
    for(const [child] of outside)child.visible=false;
    this.renderer.autoClear=false;this.renderer.clearDepth();this.renderer.render(this.scene,this.camera);this.renderer.autoClear=true;
    for(const [child,visible] of [...visibility,...outside])child.visible=visible;
  }
  animateOperation(t,dt){
    if(this.paused||this.reduced)return;
    const production=this.productionMotion;
    if(production&&this.selected===3&&this.selectionOptions?.production){
      for(const {pallet,z,phase} of production.carriers){pallet.position.x=-8+((t*.045+phase)%1)*16;pallet.position.z=z;}
      for(const {head,x,z} of production.heads)head.position.y=2.75-Math.pow(.5+.5*Math.sin(t*2+x+z),6)*.45;
    }
    const access=this.objects[5].anim;
    if(access.vehicle&&this.selected===5){
      // 0–3 approach, 3–5 identify, 5–7 raise, 7–11 pass, 11–13 lower.
      const cycle=accessCycle(t),phase=cycle.phase;
      const z=cycle.z;
      access.vehicle.position.z=z;access.vehicle.visible=cycle.visible;
      const opening=cycle.open;
      access.barrier.rotation.z=THREE.MathUtils.smoothstep(opening,0,1)*1.46;
      const identified=cycle.identified;
      access.accessLight.material.color.set(identified?'#83ebca':'#c95b2d');
      access.accessLight.material.emissive.set(identified?'#5ff2b3':'#c95b2d');access.accessLight.material.emissiveIntensity=1.2;
      access.scanBeam.visible=phase>=3&&phase<5;access.scanBeam.material.opacity=.12+.04*Math.pow(Math.sin(t*2),2);
      for(const wheel of access.wheels)if(cycle.moving)wheel.rotation.x-=dt*3.5;
      this.container.dataset.accessPhase=cycle.state;
    }
    for(const i of [0,4])for(const door of this.objects[i].anim.doors||[]){
      const open=this.focusMembers.includes(i)?1:0;
      door.rotation.y=THREE.MathUtils.damp(door.rotation.y,-open*1.25,3,dt);
    }
    let visiblePulses=0;
    for(const path of this.paths){
      const active=this.selected===3||this.selected===path.owner||(this.selected===0&&path.owner===4);
      path.mesh.material.emissiveIntensity=active?.8:.25;
      for(const [j,dot] of (path.pulses||[]).entries()){
        dot.visible=active&&visiblePulses++<1;dot.position.copy(path.curve.getPointAt((t*(active?.035:.015)+path.phase+j/(path.pulses.length))%1));dot.scale.setScalar(path.pulseRadius||.14);
      }
    }
  }
  buildProduction(g){
    const hall=new THREE.Group();hall.userData.structure=true;g.add(hall);
    box(hall,21,.22,16,0,.03,0,M.silver);
    box(hall,21,5.7,.18,0,2.85,-8,M.white);
    box(hall,.18,5.7,16,-10.5,2.85,0,M.white);
    // Open front and roof reveal production lines while keeping the nave recognizable.
    for(const x of [-10.4,-3.5,3.5,10.4]){
      box(hall,.18,6,.18,x,3,-7.9,M.silver);box(hall,.18,6,.18,x,3,7.9,M.silver);
      rod(hall,[x,6,-8],[x,7.1,0],.09,M.silver);rod(hall,[x,7.1,0],[x,6,8],.09,M.silver);
    }
    for(const z of [-7.9,0,7.9])box(hall,21,.14,.14,0,z===0?7.1:6,z,M.navy);
    box(hall,21,.12,3.2,0,6,-6.4,M.navy);
    for(const z of [-3,3]){
      box(hall,16,.2,1.3,0,.85,z,M.dark);
      for(let x=-7.5;x<=7.5;x+=.6)cylinder(hall,.1,1.2,x,.99,z,M.silver).rotation.x=Math.PI/2;
      for(const x of [-6,0,6]){
        box(hall,2,2.1,2.3,x,1.15,z,M.white);box(hall,1.65,.8,.06,x,1.8,z+1.18,M.glass);
        box(hall,.45,.3,.08,x+.5,1.4,z+1.22,M.cyan);cylinder(hall,.06,.3,x+.8,2.4,z,M.green);
        for(const side of [-1,1])box(hall,.12,.8,.9,x+side*.8,.4,z,M.navy);
      }
      for(let x=-9;x<10;x+=1.2)box(hall,.65,.02,.06,x,.18,z+1.8,M.orange);
    }
    // Existing operator station remains in the production hall.
    for(const child of g.children)if(child!==hall)child.position.z+=6;
    this.productionMotion={carriers:[],heads:[]};
    for(const z of [-3,3]){
      for(let i=0;i<7;i++){
        const pallet=new THREE.Group();pallet.position.set(-8+i*2.5,1.13,z);hall.add(pallet);
        box(pallet,.72,.12,.72,0,0,0,M.silver);box(pallet,.48,.35,.5,0,.23,0,M.orange);
        this.productionMotion.carriers.push({pallet,z,phase:i/7+(z>0?.08:0)});
      }
      for(const x of [-6,0,6]){
        const head=new THREE.Group();head.position.set(x,2.75,z);hall.add(head);
        box(head,.18,.8,.18,0,0,0,M.silver);box(head,.65,.12,.65,0,-.4,0,M.navy);
        this.productionMotion.heads.push({head,x,z});
      }
    }
  }
  buildVehicleAccess(g,a){
    const gate=new THREE.Group();gate.userData.structure=true;g.add(gate);
    box(gate,2.8,2.8,2.5,-3,1.4,0,M.white);box(gate,3.2,.2,2.9,-3,2.9,0,M.navy);
    box(gate,2.4,1.1,.04,-3,1.95,1.27,M.glass);box(gate,.04,1.1,1.8,-1.58,1.95,0,M.glass);
    box(gate,.6,1.2,.6,0,.6,0,M.orange);box(gate,.7,.15,.7,0,1.25,0,M.navy);
    const arm=new THREE.Group();arm.position.set(0,1.35,0);gate.add(arm);
    box(arm,6,.16,.2,3,0,0,M.white);for(let x=.4;x<6;x+=.8)box(arm,.3,.17,.21,x,0,0,M.orange);
    a.barrier=arm;for(const x of [-1,6.5]){cylinder(gate,.12,.8,x,.4,1.6,M.orange);box(gate,.25,.08,.25,x,.75,1.6,M.white);}
    const scanner=new THREE.Group();scanner.position.set(6.5,.1,3.5);gate.add(scanner);
    box(scanner,.15,1.3,.15,0,.65,0,M.navy);box(scanner,.35,.45,.15,0,1.3,0,M.white);
    a.accessLight=box(scanner,.22,.16,.025,0,1.34,.09,M.orange.clone());
    a.scanBeam=box(gate,4,.02,.025,4.5,1.4,3.6,M.cyan.clone());a.scanBeam.material.transparent=true;
    const vehicle=new THREE.Group();gate.add(vehicle);a.vehicle=vehicle;a.wheels=[];
    box(vehicle,1.85,.6,3.2,0,.7,0,M.white);box(vehicle,1.6,.65,1.7,0,1.25,-.2,M.navy);
    box(vehicle,1.5,.43,.035,0,1.3,-1.07,M.glass);box(vehicle,1.5,.43,.035,0,1.3,.67,M.glass);
    box(vehicle,.55,.13,.025,0,.66,-1.63,M.silver);
    for(const x of [-.62,.62]){box(vehicle,.32,.14,.03,x,.8,-1.64,M.cyan);box(vehicle,.32,.14,.03,x,.8,1.64,M.orange);}
    for(const x of [-.94,.94])for(const z of [-1,1]){const wheel=cylinder(vehicle,.34,.18,x,.4,z,M.dark);wheel.rotation.z=Math.PI/2;wheel.userData.dynamic=true;a.wheels.push(wheel);}
    vehicle.position.set(3,0,7.5);
  }
  buildAmbientZones(){
    this.codeScreens=[];
    const person=(parent,x,z,seated=false)=>{
      const p=new THREE.Group();p.position.set(x,0,z);parent.add(p);
      sphere(p,.17,0,1.42,0,M.silver);box(p,.36,.55,.24,0,1.01,0,M.blue);
      for(const side of [-1,1]){
        rod(p,[side*.11,.75,0],[side*.11,seated?.45:.15,seated?.3:0],.065,M.navy);
        rod(p,[side*.23,1.2,0],[side*.25,seated?1.05:.8,seated?-.42:0],.055,M.silver);
      }
      return p;
    };
    const room=(x,z,w,d)=>{
      const g=new THREE.Group();g.position.set(x,.2,z);this.world.add(g);
      box(g,w,.12,d,0,0,0,M.silver);box(g,w,2.8,.1,0,1.4,-d/2,M.white);
      box(g,.1,2.8,d,-w/2,1.4,0,M.glass);box(g,w,.12,.55,0,2.85,-d/2+.2,M.navy);
      return g;
    };
    // Discreet software office beside the connected campus.
    this.softwareOffice=room(10,6.5,6,4.8);
    for(const x of [0]){
      box(this.softwareOffice,2,.1,.85,x,.95,-.35,M.silver);
      for(const side of [-.8,.8])box(this.softwareOffice,.07,.9,.65,x+side,.45,-.35,M.navy);
      box(this.softwareOffice,.12,.3,.12,x,1.12,-.55,M.navy);
      box(this.softwareOffice,1.2,.75,.1,x,1.57,-.6,M.dark);
      const canvas=document.createElement('canvas');canvas.width=384;canvas.height=224;
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.08,.64),new THREE.MeshBasicMaterial({map:texture}));
      screen.position.set(x,1.57,-.54);this.softwareOffice.add(screen);this.codeScreens.push({canvas,texture,last:-1});
      box(this.softwareOffice,.8,.025,.28,x,1.02,-.02,M.dark);
      box(this.softwareOffice,.65,.1,.6,x,.55,.65,M.navy);box(this.softwareOffice,.65,.65,.1,x,.85,.95,M.navy);
      person(this.softwareOffice,x,.55,true);
    }
  }
  animateAmbient(t){
    for(const s of this.codeScreens){
      if(s.last>=0&&(this.paused||this.reduced||this.selected!==7||this.selectionOptions?.production||t-s.last<1.2))continue;s.last=t;
      const c=s.canvas.getContext('2d');c.fillStyle='#0a1d32';c.fillRect(0,0,384,224);
      c.fillStyle='#b8c8d5';c.font='16px monospace';c.fillText('NAITEL / SOFTWARE',14,23);
      const lines=['const plant = connect();','async function sync(zone) {','  const data = await zone.read();','  return plant.update(data);','}','await sync(production);','// ERP / CRM integration','status.publish("connected");'];
      for(let n=0;n<9;n++){c.fillStyle=n%3?'#83ebca':'#52d9fa';c.fillText(lines[(n+Math.floor(t*.8))%lines.length],14,52+n*19);}
      s.texture.needsUpdate=true;
    }
  }
  buildZoneLabels(){
    this.zoneLabels=[{es:'Centro de datos',en:'Data center',index:0,p:[9,5.3,-2]},{es:'Cableado',en:'Cabling',index:3,p:[0,4.5,-2]},{es:'Acceso vehicular',en:'Vehicle access',index:5,p:[-3,3.5,9]}].map(zone=>{
      const label=document.createElement('button');label.className='object-label campus-label';label.innerHTML='<span class="label-name"></span>';label.addEventListener('click',()=>this.onSelect(zone.index,{zone:true}));document.querySelector('#labels').append(label);return {...zone,label};
    });
    for(const zone of [{es:'Desarrollo de software',en:'Software development',index:7,p:[10/SPACING,3.3,6.5/SPACING]}]){
      const label=document.createElement('button');label.className='object-label campus-label support-label';label.innerHTML='<span class="label-name"></span>';
      label.addEventListener('click',()=>this.onSelect(zone.index));document.querySelector('#labels').append(label);this.zoneLabels.push({...zone,label});
    }
    this.setLanguage(document.documentElement.lang);
  }
  setLanguage(language){for(const zone of this.zoneLabels||[])zone.label.querySelector('.label-name').textContent=language==='es'?zone.es:zone.en;}
  updateZoneLabels(){for(const zone of this.zoneLabels||[]){const point=new THREE.Vector3(zone.p[0]*SPACING,zone.p[1],zone.p[2]*SPACING).applyMatrix4(this.world.matrixWorld).project(this.camera);zone.label.style.transform=`translate(${(point.x*.5+.5)*this.container.clientWidth}px,${(-point.y*.5+.5)*this.container.clientHeight}px) translate(-50%,-100%)`;zone.label.hidden=this.selected>=0||point.z>1;}}

  buildPlatform(){
    this.platform=new THREE.Group();this.platform.userData.layout=true;this.world.add(this.platform);
    this.platform.userData.layout=false;
    box(this.platform,60,.68,36,0,-.5,0,M.dark);
    box(this.platform,60.12,.09,36.12,0,-.12,0,M.navy);
    this.deck=box(this.platform,60,.08,36,0,-.025,0,M.floor);
    for(const z of [-18,18])box(this.platform,60,.025,.025,0,-.1,z,M.cyan);
    for(const x of [-30,30])box(this.platform,.025,.025,36,x,-.1,0,M.cyan);
    const points=[];for(let x=-29;x<30;x+=2)points.push(x,.025,-17,x,.025,17);
    for(let z=-17;z<18;z+=2)points.push(-29,.025,z,29,.025,z);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    this.grid=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x29b6f6,transparent:true,opacity:.12}));this.platform.add(this.grid);
    // Vehicle approach, pedestrian clearances and a separated technical yard.
    box(this.platform,42,.025,5,0,.03,13,M.dark);
    for(let x=-26;x<26;x+=3)box(this.platform,1.3,.015,.06,x,.05,13,M.white);
    // One building envelope, with an open front for the visitor to see its operation.
    const campus=new THREE.Group();this.platform.add(campus);
    box(campus,60,.12,25,0,.13,-3,M.floor);
    // Shared rear wall, service corridor and covered connection join both wings.
    box(campus,55,3.6,.18,0,1.9,-13,M.white);
    box(campus,8,.18,5,1.7,.15,-2.8,M.silver);
    for(const x of [-2.2,5.6]){
      box(campus,.13,4.4,.13,x,2.3,-5.3,M.silver);box(campus,.13,4.4,.13,x,2.3,-.3,M.silver);
    }
    box(campus,8,.12,5,1.7,4.5,-2.8,M.glass);
    box(campus,8,.15,.16,1.7,4.5,-5.3,M.navy);box(campus,8,.15,.16,1.7,4.5,-.3,M.navy);
    // Technical wing shares the same foundation and service access.
    box(campus,9,.1,23,24,.17,-1,M.silver);
    box(campus,.15,3.8,23,28.5,2,-1,M.glass);
    for(const x of [19.5,24,28.5])box(campus,.13,4,.13,x,2.1,-12.5,M.silver);
    box(campus,9,.18,2,24,4,-11.5,M.navy);
    // Internal circulation, fenced perimeter and one entry lane through the guardhouse.
    for(const z of [-15,10])box(campus,53,.025,.08,0,.2,z,M.orange);
    box(campus,7,.04,12,-1.2,.04,17,M.dark);
    for(let z=10;z<23;z+=2)box(campus,.08,.015,.8,-1.2,.075,z,M.white);
    for(const [left,right] of [[-29,-8],[3,29]]){
      for(let x=left;x<=right;x+=3)box(campus,.06,1.2,.06,x,.6,17.5,M.silver);
      box(campus,right-left,.045,.045,(left+right)/2,1.15,17.5,M.navy);
      box(campus,right-left,.045,.045,(left+right)/2,.45,17.5,M.navy);
    }
    // Marcas discretas numeradas en el piso, sin pedestales independientes.
    for(const [i,s] of services.entries()){
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
      const context=canvas.getContext('2d');context.fillStyle='#c2410c';context.font='40px monospace';context.fillText(String(i+1).padStart(2,'0'),8,44);
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const mark=new THREE.Mesh(new THREE.PlaneGeometry(.7,.35),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
      mark.rotation.x=-Math.PI/2;mark.position.set((s.position[0]-.7)*SPACING,.045,(s.position[1]+1.1)*SPACING);this.platform.add(mark);
      box(this.platform,.7,.012,.025,s.position[0]+.2,.045,s.position[1]+1.05,M.orange);
    }
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.ShadowMaterial({color:0x243d60,opacity:.2}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.5;floor.receiveShadow=true;this.scene.add(floor);
  }
  async buildServices(onProgress){
    const labels=document.querySelector('#labels');
    for(const [i,s] of services.entries()){
      const group=new THREE.Group();group.position.set(s.position[0]*SPACING,.14,s.position[1]*SPACING);this.world.add(group);
      const equipment=new THREE.Group();group.add(equipment);const anim={leds:[],fibers:[],air:[],dome:null};builders[i](equipment,anim,s);
      if(i===0)this.buildDataCenter(equipment);
      if(i===5)this.buildVehicleAccess(equipment,anim);
      if(i===7)this.buildProduction(equipment);
      this.instanceLEDs(equipment,anim);this.instanceStatic(equipment,anim);equipment.children.forEach((p,j)=>this.preparePart(p,j));
      const dimensions=[[10,5,8],[6.5,3.1,4.4],[10,3,5.5],[12,5,7],[5,3.5,4],[9,4,13],[3.7,3.1,2.5],[15,7,13]][i];dimensions[0]*=SPACING;dimensions[2]*=SPACING;const size=new THREE.Vector3(...dimensions);const center=new THREE.Vector3(i===1?1.8:i===2?3.3:i===4?1.1:0,i===3?2.4:dimensions[1]/2,i===2?-.8:0);const halo=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x+.18,size.y+.18,size.z+.18)),new THREE.LineBasicMaterial({color:0x29b6f6,transparent:true,opacity:0}));halo.position.copy(center);group.add(halo);
      const hit=box(group,size.x+.3,size.y+.3,size.z+.3,center.x,center.y,center.z,new THREE.MeshBasicMaterial({visible:false}));hit.userData.service=i;
      const label=document.createElement('button');label.className='object-label';label.innerHTML=`<span class="label-number">${String(i+1).padStart(2,'0')}</span><span class="label-name">${s.short}</span>`;label.setAttribute('aria-label',`Explorar ${s.name}`);label.addEventListener('click',()=>this.onSelect(i));label.addEventListener('pointerenter',()=>this.hover(i));label.addEventListener('pointerleave',()=>this.hover(-1));label.addEventListener('focus',()=>this.hover(i));label.addEventListener('blur',()=>this.hover(-1));labels.append(label);
      const materials=new Map();equipment.traverse(mesh=>{if(!mesh.isMesh)return;mesh.userData.service=i;mesh.userData.zone=i===3;for(let ancestor=mesh.parent;ancestor&&ancestor!==equipment;ancestor=ancestor.parent)if(ancestor.userData.structure)mesh.userData.zone=true;this.pickables.push(mesh);const key=mesh.material.uuid;if(!materials.has(key)){const m=mesh.material.clone();m.userData.baseOpacity=m.opacity;m.userData.baseColor=m.color.clone();m.userData.baseEmissive=m.emissiveIntensity;materials.set(key,m);}mesh.material=materials.get(key);});
      const ring=new THREE.Mesh(new THREE.RingGeometry(1.2,1.27,64),new THREE.MeshBasicMaterial({color:0x29b6f6,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.07;group.add(ring);

      this.objects.push({ring,group,equipment,anim,halo,hit,label,materials:[...materials.values()],base:group.position.clone(),focus:{mix:0,dim:0,hoverDim:0},ripple:{value:0}});
      onProgress(22+(i+1)*6);await nextFrame();
    }
  }
  instanceLEDs(root,anim){
    const parents=new Set();root.traverse(node=>parents.add(node));
    const groups=new Map();
    for(const entry of anim.leds){if(!parents.has(entry.mesh.parent))continue;const parent=entry.mesh.parent;if(!groups.has(parent))groups.set(parent,[]);groups.get(parent).push(entry);}
    anim.ledBatches||=[];
    const batched=new Set();
    for(const [parent,entries] of groups){
      if(entries.length<4)continue;
      const batch=new THREE.InstancedMesh(entries[0].mesh.geometry,entries[0].mesh.material,entries.length);
      const items=entries.map((entry,i)=>{entry.mesh.updateMatrix();batch.setMatrixAt(i,entry.mesh.matrix);batched.add(entry);parent.remove(entry.mesh);return {matrix:entry.mesh.matrix.clone(),phase:entry.phase,visible:true};});
      batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);batch.castShadow=false;batch.computeBoundingSphere();parent.add(batch);anim.ledBatches.push({mesh:batch,items});
    }
    anim.leds=anim.leds.filter(entry=>!batched.has(entry));
  }
  instanceStatic(root,anim){
    const dynamic=new Set([...(anim.leds||[]).map(x=>x.mesh),...(anim.flow||[]).map(x=>x.dot),...(anim.cableFlows||[]).map(x=>x.dot),...(anim.waves||[]).map(x=>x.mesh),...(anim.fibers||[]).map(x=>x.mesh),...(anim.air||[]),...(anim.strobes||[]),anim.dome]);
    const parents=[];root.traverse(p=>{if(p.children.length)parents.push(p);});
    for(const parent of parents){const groups=new Map();for(const mesh of parent.children){if(!mesh.isMesh||mesh.isInstancedMesh||mesh.userData.dynamic||dynamic.has(mesh)||Array.isArray(mesh.material))continue;const key=mesh.geometry.uuid+mesh.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);}
      for(const meshes of groups.values()){if(meshes.length<4)continue;const first=meshes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);meshes.forEach((m,i)=>{m.updateMatrix();batch.setMatrixAt(i,m.matrix);parent.remove(m);});batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.computeBoundingSphere();parent.add(batch);}
    }
  }
  buildContactShadows(){
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,4,64,64,63);gradient.addColorStop(0,'rgba(0,5,15,.42)');gradient.addColorStop(1,'rgba(0,5,15,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const map=new THREE.CanvasTexture(canvas);
    const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false});this.objects.forEach(o=>{const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4,3),mat);shadow.rotation.x=-Math.PI/2;shadow.position.set(o.base.x,.045,o.base.z);this.world.add(shadow);});
  }
  buildConnections(){
    // Every visible run belongs to a continuous campus network, including the entrance.
    const service=this.objects[3],root=new THREE.Group();root.userData.structure=true;service.equipment.add(root);
    const origin=service.base;
    const run=(owner,worldPoints)=>{
      const points=worldPoints.map(([x,y,z])=>[x-origin.x,y-origin.y,z-origin.z]);
      const route=pipe(root,points,.085,material('#1385b5',{emissive:'#29b6f6',emissiveIntensity:1.65}));
      const pulseMaterial=new THREE.MeshBasicMaterial({color:'#c2faff',toneMapped:false});
      const pulses=Array.from({length:1},()=>sphere(root,.14,0,0,0,pulseMaterial));
      this.paths.push({...route,pulses,pulseRadius:.14,dot:pulses[0],owner,phase:owner*.11,baseGlow:1.65});
      // Paired rails and ladder rungs make the physical containment readable.
      for(const offset of [-.23,.23])pipe(root,points.map(([x,y,z])=>[x,y-.14,z+offset]),.045,M.silver);
      const length=route.curve.getLength(),steps=Math.ceil(length/.7);
      for(let n=0;n<=steps;n++){const p=route.curve.getPointAt(n/steps);box(root,.08,.06,.56,p.x,p.y-.16,p.z,M.silver);}
      for(const [x,y,z] of worldPoints)if(y>2.8)rod(root,[x-origin.x,.1,z-origin.z],[x-origin.x,y-.1,z-origin.z],.055,M.silver);
    };
    // Main ring: MDF → production → access → technical wing → MDF.
    run(7,[[12.6,2.8,-7],[12.6,3.85,-2.8],[-12.6,3.85,-2.8],[-12.6,1.2,1.4]]);
    run(5,[[-12.6,3.85,-2.8],[-2,3.85,-2.8],[-2,3.85,8.5],[-2,.2,8.5],[-4.2,.2,10.5],[-4.2,1.2,12.6]]);
    run(2,[[12.6,2.8,-7],[18.5,3.85,-7],[18.5,3.85,8.4],[22.4,1.8,8.4]]);
    run(1,[[18.5,3.85,-7],[22.4,3.85,-7],[22.4,2.5,-2.8]]);
    run(6,[[22.4,3.85,-7],[22.4,2.4,-11.2]]);
    run(4,[[11.5,1.2,-7],[12.6,3.4,-7],[13.5,1.2,-7]]);
    // Shared entrance guide branches into the support rooms, then rejoins the MDF.
    run(5,[[-4.2,1.2,12.6],[-4.2,.3,10],[3,.3,10],[3,.3,8.6],[3,2.95,8.6],[3,2.95,4.2]]);
    run(7,[[3,2.95,4.2],[10,2.95,4.2],[10,2.95,6],[10,1.2,6]]);
    run(7,[[10,2.95,4.2],[12.6,3.4,4.2],[12.6,3.4,-7]]);
    for(const z of [-5.1,-.5])run(0,[[12.6,3.4,-7],[12.6,3.4,z],[8.5,3.4,z],[8.5,2.6,z]]);
    for(const [owner,o] of this.objects.entries())for(const route of o.anim.fibers){
      const pulses=Array.from({length:1},()=>sphere(o.equipment,.075,0,0,0,M.cyan));
      this.paths.push({...route,pulses,pulseRadius:.075,dot:pulses[0],phase:owner*.13,owner,baseGlow:.65});
    }
    this.instanceStatic(root,{fibers:this.paths,flow:this.paths.flatMap(p=>p.pulses.map(dot=>({dot})))});this.prepareMaterials(root,service,3);this.preparePart(root,0);
  }
  buildParticles(){
    // Keep the campus free of decorative floating particles.
  }
    /* Encuadre automático: zoom óptico 2.071875 y límites de seguridad para que
     la base completa y el equipo enfocado permanezcan dentro del área útil. */
  framing(index=-1,{tour=false,production=false}={}){
    const mobile=this.mobile;
    const rotation=0;
    let points;
    if(index<0){
      if(!this.overviewPoints){
        this.world.updateMatrixWorld(true);const inverse=this.world.matrixWorld.clone().invert();
        this.overviewPoints=[];
        this.world.traverse(mesh=>{
          if(!mesh.isMesh||!mesh.material.visible)return;
          mesh.geometry.computeBoundingBox();
          if(mesh.isInstancedMesh){const matrix=new THREE.Matrix4();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);for(const p of this.boxCorners(mesh.geometry.boundingBox))this.overviewPoints.push(p.applyMatrix4(matrix).applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse));}}else for(const p of this.boxCorners(mesh.geometry.boundingBox))this.overviewPoints.push(p.applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse));
        });
        // Reserve the existing service envelopes before secondary equipment arrives.
        for(const o of this.objects){const center=o.base.clone().add(o.hit.position);this.overviewPoints.push(...this.boxCorners(new THREE.Box3().setFromCenterAndSize(center,o.hit.scale)));}
      }
      points=this.overviewPoints.map(p=>p.clone().applyAxisAngle(UP,rotation));
    }else if(index===7&&!production){
      const room=this.softwareOffice;
      points=this.boxCorners(new THREE.Box3().setFromCenterAndSize(room.position.clone().add(new THREE.Vector3(0,1.5,0)),new THREE.Vector3(7,3.5,6)));
    }else if(index===3&&production){
      // Show cabling above the working production hall as the final service.
      points=this.boxCorners(new THREE.Box3(new THREE.Vector3(-24,0,-13),new THREE.Vector3(5,8,9)));
    }else if(index===3){
      // Cabling demonstrates the whole signal path, including both endpoints and access.
      points=this.boxCorners(new THREE.Box3(new THREE.Vector3(-13.5,0,-12.5),new THREE.Vector3(23.5,4.5,13.5)));
    }else{
      const o=this.objects[index],center=o.base.clone().add(o.hit.position);
      const size=o.hit.scale.clone().multiply(new THREE.Vector3(1.12,1.18,1.12));
      points=this.boxCorners(new THREE.Box3().setFromCenterAndSize(center,size));
    }
    const box=new THREE.Box3().setFromPoints(points),center=box.getCenter(new THREE.Vector3());
    const direction=(index<0?new THREE.Vector3(3,14,40):new THREE.Vector3(8,12,30)).normalize();
    const right=new THREE.Vector3().crossVectors(UP,direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();
    let xMin=mobile?-.95:-.35,xMax=mobile?.76:.87,yMin=-.95,yMax=.95;
    if(index<0){
      // Fill more of the initial viewport, preserving the current camera direction.
      const original=mobile?{x0:-.95,x1:.76,y0:-.72,y1:.25}:{x0:-.35,x1:.87,y0:-.95,y1:.95};
      const mx=(original.x0+original.x1)/2,my=(original.y0+original.y1)/2;
      const hx=(original.x1-original.x0)*OVERVIEW.scale/2,hy=(original.y1-original.y0)*OVERVIEW.scale/2;
      xMin=Math.max(-.95,mx-hx);xMax=Math.min(.94,mx+hx);yMin=Math.max(-.97,my-hy);yMax=Math.min(.97,my+hy);
      if(mobile){
        // The approved hero remains in place; keep the equipment below its card.
        const stage=this.container.getBoundingClientRect(),hero=document.querySelector('.hero-heading').getBoundingClientRect();
        yMax=Math.min(yMax,1-2*(hero.bottom-stage.top+10)/stage.height);
      }
    }
    if(index>=0&&!mobile){
      const stage=this.container.getBoundingClientRect(),panel=document.querySelector('.detail-panel').getBoundingClientRect();
      xMin=-.94;xMax=Math.min(.2,2*(panel.left-stage.left-30)/stage.width-1);yMin=-.88;yMax=.88;
    }
    if(index===3&&!mobile&&!tour){xMin=-.92;xMax=.86;yMin=-.08;yMax=.9;}
    if(index>=0&&mobile){
      xMax=.72;
      const stage=this.container.getBoundingClientRect(),sheet=document.querySelector('.detail-panel').offsetHeight+48;
      const visible=Math.max(115,Math.min(stage.height,innerHeight-sheet-stage.top-14));
      yMin=1-2*visible/stage.height;yMax=.9;
    }
    // Guided stops reserve the same space for the integrated solution panel.
    const cx=(xMin+xMax)/2,cy=(yMin+yMax)/2,fov=index<0?OVERVIEW.fov:40;
    const candidate=new THREE.PerspectiveCamera(fov,this.camera.aspect,.1,600);candidate.zoom=this.camera.zoom;
    let distance=index<0?25/OVERVIEW.scale:9,position,target;
    for(let attempt=0;attempt<145;attempt++){
      const viewHeight=2*distance*Math.tan(THREE.MathUtils.degToRad(fov/2))/candidate.zoom;
      const shift=right.clone().multiplyScalar(-cx*viewHeight*this.camera.aspect/2).addScaledVector(up,-cy*viewHeight/2);
      target=center.clone().add(shift);position=target.clone().addScaledVector(direction,distance);
      candidate.position.copy(position);candidate.lookAt(target);candidate.updateProjectionMatrix();candidate.updateMatrixWorld();
      // Centrar la silueta proyectada, no la caja en coordenadas del mundo:
      // la perspectiva acerca el borde frontal y exige compensar su asimetría.
      for(let recenter=0;recenter<4;recenter++){
        const {minX,maxX,minY,maxY}=this.projectedBounds(points,candidate);
        target.addScaledVector(right,((minX+maxX)/2-cx)*viewHeight*this.camera.aspect/2).addScaledVector(up,((minY+maxY)/2-cy)*viewHeight/2);
        position=target.clone().addScaledVector(direction,distance);candidate.position.copy(position);candidate.lookAt(target);candidate.updateMatrixWorld();
      }
      const bounds=this.projectedBounds(points,candidate);
      const safe=bounds.minX>=xMin&&bounds.maxX<=xMax&&bounds.minY>=yMin&&bounds.maxY<=yMax&&bounds.maxZ<1;
      if(safe)break;distance*=1.035;
    }
    if(index<0)position=target.clone().addScaledVector(direction,distance*OVERVIEW.distanceScale);
    return {x:position.x,y:position.y,z:position.z,tx:target.x,ty:target.y,tz:target.z,fov};
  }
  projectedBounds(points,camera){
    const e=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements;
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,maxZ=-Infinity;
    for(const p of points){const w=1/(e[3]*p.x+e[7]*p.y+e[11]*p.z+e[15]);
      const x=(e[0]*p.x+e[4]*p.y+e[8]*p.z+e[12])*w,y=(e[1]*p.x+e[5]*p.y+e[9]*p.z+e[13])*w,z=(e[2]*p.x+e[6]*p.y+e[10]*p.z+e[14])*w;
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);maxZ=Math.max(maxZ,z);
    }return {minX,maxX,minY,maxY,maxZ};
  }
  boxCorners(box){const p=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])p.push(new THREE.Vector3(x,y,z));return p;}
  resize(){
    const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;
    if(this.assembling)this.introTimeline?.progress(1);
    this.mobile=innerWidth<=700;this.camera.aspect=w/h;this.camera.zoom=OVERVIEW.zoom;this.renderer.setSize(w,h);
    if(this.backgroundTarget){const ratio=this.renderer.getPixelRatio();this.backgroundTarget.setSize(Math.round(w*ratio),Math.round(h*ratio));this.blurMaterial.uniforms.pixel.value.set(1/(w*ratio),1/(h*ratio));}
    this.home=this.framing(-1);
    if(this.transitioning&&this.cameraFlight&&this.container.dataset.cameraRoute==='access-software-data-production'){
      this.camera.updateProjectionMatrix();this.publishCamera();return;
    }
    if(this.touring&&this.onTourResize){this.onTourResize();this.camera.updateProjectionMatrix();this.publishCamera();return;}
    if(this.selected<0){this.cameraFlight?.kill();gsap.killTweensOf(this.world.rotation);this.transitioning=false;Object.assign(this.cameraState,this.home);this.world.rotation.y=0;}
    else this.select(this.selected,{...this.selectionOptions,refit:true});
    this.camera.updateProjectionMatrix();
    this.publishCamera();
  }
  bind(){
    const canvas=this.renderer.domElement;let start=null;
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);this.parallax.x=this.pointer.x;this.parallax.y=this.pointer.y;if(e.pointerType==='mouse')this.needsPick=true;});
    canvas.addEventListener('pointerleave',()=>{this.pointer.set(-10,-10);this.parallax.x=0;this.parallax.y=0;this.hover(-1);});
    canvas.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};});
    canvas.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>48||Math.abs(dy)>48){this.onSelect((Math.max(0,this.selected)+(Math.abs(dx)>Math.abs(dy)?(dx<0?1:7):(dy<0?1:7)))%8);return;}const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.pickables.filter(m=>m.visible&&m.parent.visible))[0]||this.raycaster.intersectObjects(this.objects.map(o=>o.hit))[0];if(hit)this.onSelect(hit.object.userData.service,{zone:hit.object.userData.zone===true});});
  }
  pick(){if(this.transitioning)return;this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.pickables.filter(m=>m.visible&&m.parent.visible))[0]||this.raycaster.intersectObjects(this.objects.map(o=>o.hit))[0];this.hover(hit?hit.object.userData.service:-1);}
  updateMaterials(o){
    const amount=Math.max(o.focus.dim,o.focus.hoverDim||0);
    o.materials.forEach(m=>{
      // Equipment stays opaque; only glass and effects retain their source alpha.
      m.opacity=m.userData.baseOpacity;m.color.copy(m.userData.baseColor);
      const gray=m.color.r*.2126+m.color.g*.7152+m.color.b*.0722;
      m.color.lerp(MATERIAL_GRAY.setRGB(gray,gray,gray),amount*.3);
      m.emissiveIntensity=m.userData.baseEmissive*(1-amount*.18);
    });
  }
  hover(index){if(this.selected>=0||this.hovered===index||this.assembling)return;this.hovered=index;this.objects.forEach((o,i)=>{const active=i===index;o.label.classList.toggle('is-hovered',active);gsap.to(o.group.position,{y:o.base.y,duration:this.reduced?.15:.5,ease:'back.out(1.2)',overwrite:true});gsap.to(o.halo.material,{opacity:active?.65:0,duration:.3,ease:'power2.out',overwrite:true});gsap.to(o.focus,{hoverDim:index>=0&&!active?1:0,duration:.35,ease:'power2.out',overwrite:'auto',onUpdate:()=>this.updateMaterials(o)});});for(const p of this.paths)gsap.to(p.mesh.material,{emissiveIntensity:index>=0&&p.owner===index?2.1:(p.baseGlow??.45),duration:.5,ease:'power2.out',overwrite:true});this.renderer.domElement.style.cursor=index>=0?'pointer':'default';}
  intro(){
    if(this.reduced){this.startDeferred().catch(error=>console.warn('Deferred scene',error));return;}
    this.startupSample={start:performance.now(),last:performance.now(),frames:0,total:0,max:0,over50ms:0};
    this.assembling=true;this.transitioning=true;this.world.position.y=0;this.platform.scale.set(1,1,1);
    const end={...this.home},start={...end};
    for(const [axis,target] of [['x','tx'],['y','ty'],['z','tz']])start[axis]=end[target]+(end[axis]-end[target])*1.04;
    Object.assign(this.cameraState,start);
    const tl=gsap.timeline({onComplete:()=>{this.assembling=false;this.transitioning=false;this.startDeferred().catch(error=>console.warn('Deferred scene',error));}});
    this.introTimeline=tl;
    tl.to(this.cameraState,{...end,duration:1.6,ease:'sine.inOut'},0);
    this.objects.forEach(o=>{o.group.position.y=o.base.y;o.equipment.scale.setScalar(1);o.halo.material.opacity=0;});
    return tl;
  }
  walkRoute(index,options,start,target){
    // A single gentle curve between the current view and the next zone.
    const poses=[start,target];
    const positions=new THREE.CatmullRomCurve3(poses.map(p=>new THREE.Vector3(p.x,p.y,p.z)),false,'centripetal');
    const looks=new THREE.CatmullRomCurve3(poses.map(p=>new THREE.Vector3(p.tx,p.ty,p.tz)),false,'centripetal');
    return {poses,positions,looks,stops:0};
  }
  select(index,options={}){
    this.selectionOptions=options;
    if(this.assembling)this.introTimeline?.progress(1);
    this.hover(-1);
    this.selected=index;
    if(index>=0)this.focusMembers=index===3&&options.production?[3,7]:[index];
    if(this.reduced)for(const i of [0,4])for(const door of this.objects[i].anim.doors||[])door.rotation.y=this.focusMembers.includes(i)&&index>=0?-1.25:0;
    gsap.to(this.focusEffect,{amount:index>=0?1:0,duration:this.reduced?.18:1.15,ease:'power2.inOut',overwrite:true,onComplete:()=>{if(this.selected<0)this.focusMembers=[];}});
    for(const p of this.paths)gsap.to(p.mesh.material,{emissiveIntensity:index>=0&&p.owner===index?3:(p.baseGlow??.45),duration:.6});this.transitioning=true;gsap.killTweensOf(this.cameraState);gsap.killTweensOf(this.world.rotation);
    let duration=this.reduced?.18:(options.duration??1.6);const state=this.cameraState;const start={...state};let target;
    target=index<0?{...this.home}:this.framing(index,options);
    const walk=index>=0&&!this.reduced&&!options.refit&&(options.routeFromEntrance||options.tour)?this.walkRoute(index,options,start,target):null;
    if(walk)duration=Math.max(duration,1.6);
    this.container.dataset.cameraRoute=walk?'access-software-data-production':'direct';
    const progress={p:0};if(this.cameraFlight)this.cameraFlight.kill();
    this.cameraFlight=gsap.timeline({onComplete:()=>{this.transitioning=false;options.onComplete?.();}})
      .to(this.world.rotation,{y:0,z:0,duration,ease:'power2.inOut'},0)
      .to(progress,{p:1,duration,ease:'sine.inOut',onUpdate:()=>{const t=progress.p;if(walk){const p=walk.positions.getPoint(t),look=walk.looks.getPoint(t);Object.assign(state,{x:p.x,y:p.y,z:p.z,tx:look.x,ty:look.y,tz:look.z});const n=t*(walk.poses.length-1),i=Math.min(walk.poses.length-2,Math.floor(n)),v=THREE.MathUtils.smoothstep(n-i,0,1);state.fov=THREE.MathUtils.lerp(walk.poses[i].fov,walk.poses[i+1].fov,v);}else{for(const k of Object.keys(target))state[k]=THREE.MathUtils.lerp(start[k],target[k],t);}}},0);
    if(walk)this.cameraFlight.to(this.focusEffect,{amount:1,duration:1,ease:'sine.inOut'},Math.max(0,duration-1));
    this.objects.forEach((o,i)=>{const chosen=this.focusMembers.includes(i)&&index>=0;gsap.to(o.focus,{mix:chosen?1:0,dim:index>=0&&!chosen?1:0,duration:this.reduced?.15:1,ease:'power2.inOut',overwrite:true,onUpdate:()=>{this.updateMaterials(o);}});o.label.classList.toggle('is-selected',chosen);if(chosen){o.ripple.value=0;gsap.to(o.ripple,{value:1,duration:1.4,ease:'power3.out',overwrite:true});}});
    return this.cameraFlight;
  }
  setTheme(dark){gsap.to(this.ambient,{intensity:dark?.9:2.7,duration:1,ease:'power2.inOut'});gsap.to(this.key,{intensity:dark?1.7:4.4,duration:1,ease:'power2.inOut'});gsap.to(this.fill,{intensity:dark?3:1.5,duration:1,ease:'power2.inOut'});gsap.to(this.renderer,{toneMappingExposure:dark?.9:1.3,duration:1,ease:'power2.inOut'});const target=new THREE.Color(dark?'#0b192d':'#12243a');const mat=this.deck.material;gsap.to(mat.color,{r:target.r,g:target.g,b:target.b,duration:1,ease:'power2.inOut'});}
  loop=()=>{
    if(!this.running||document.hidden)return;this.frameRequest=requestAnimationFrame(this.loop);const dt=Math.min(this.clock.getDelta(),.05);
    if(this.startupSample){const sample=this.startupSample,now=performance.now(),elapsed=now-sample.last;sample.last=now;sample.frames++;sample.total+=elapsed;sample.max=Math.max(sample.max,elapsed);if(elapsed>50)sample.over50ms++;
      if(now-sample.start>=3000){this.container.dataset.startupMetrics=JSON.stringify({frames:sample.frames,fps:Number((sample.frames*1000/sample.total).toFixed(1)),maxFrameMs:Number(sample.max.toFixed(1)),over50ms:sample.over50ms});this.startupSample=null;}
    }
    this.frameCount=(this.frameCount||0)+1;if(this.frameCount===90)this.sampleStart=performance.now();if(this.frameCount===210){const fps=120000/(performance.now()-this.sampleStart);this.measuredFPS=fps;document.documentElement.dataset.sampleFps=fps.toFixed(1);if(fps<42){this.lowPower=true;this.renderer.setPixelRatio(1);this.renderer.shadowMap.enabled=false;if(this.particles)this.particles.visible=false;}}
if(!this.paused)this.time+=dt;const t=this.time;const idle=this.selected<0&&!this.transitioning&&!this.paused&&!this.reduced;
    if(!this.assembling){if(idle){this.world.position.y=0;this.world.rotation.y=0;}else this.world.position.y=THREE.MathUtils.lerp(this.world.position.y,0,.04);}
    const state=this.cameraState;const motion=false;this.camera.position.set(state.x+(motion?this.parallax.x*.25:0),state.y+(motion?this.parallax.y*.18:0),state.z);this.lookAt.set(state.tx,state.ty,state.tz);this.camera.lookAt(this.lookAt);this.camera.fov=state.fov;this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    if(this.needsPick){this.pick();this.needsPick=false;}
    this.objects.forEach((o,i)=>{
      const dim=o.focus.dim,mix=o.focus.mix;
      o.halo.visible=this.selected<0;
      o.ring.material.opacity=mix*(this.reduced?.18:.18+Math.sin(t*.7)*.025);o.ring.scale.setScalar(1+mix*.3);
      o.equipment.position.y=0;o.equipment.rotation.y=0;
      if(!this.assembling)o.equipment.scale.setScalar(1);

      if(!this.paused&&this.focusMembers.includes(i)){o.anim.leds.forEach(({mesh,phase})=>{mesh.visible=Math.sin(t*2+phase*2.1)>-.65;});o.anim.air.forEach((a,j)=>{a.position.y=(a.userData.pipeOrigin?.y||0)+Math.sin(t*1.8+j)*.07;a.scale.y=.96+Math.sin(t*1.8+j)*.04;});if(o.anim.dome)o.anim.dome.rotation.y=Math.sin(t*.45)*.55;}
      if(!this.paused&&this.focusMembers.includes(i))for(const batch of o.anim.ledBatches||[]){let changed=false;for(const [index,item] of batch.items.entries()){const visible=Math.sin(t*2+item.phase*2.1)>-.65;if(visible===item.visible)continue;item.visible=visible;batch.mesh.setMatrixAt(index,visible?item.matrix:new THREE.Matrix4().makeScale(0,0,0));changed=true;}if(changed)batch.mesh.instanceMatrix.needsUpdate=true;}
      if(!this.paused&&this.focusMembers.includes(i))this.animateDetails?.(o,t*.35,true);
      o.group.updateWorldMatrix(true,false);const point=(i===7&&!this.selectionOptions?.production?this.softwareOffice.position.clone().add(new THREE.Vector3(0,3.1,0)).applyMatrix4(this.world.matrixWorld):new THREE.Vector3(services[i].label[0]*SPACING,services[i].label[1],services[i].label[2]*SPACING).applyMatrix4(o.group.matrixWorld)).project(this.camera);const x=(point.x*.5+.5)*this.container.clientWidth,y=(-point.y*.5+.5)*this.container.clientHeight;o.label.style.transform=`translate(${x}px,${y}px) translate(-50%,0)`;o.label.style.opacity=String(this.selected<0?1:(i===this.selected?1:0));o.label.style.pointerEvents=this.selected>=0&&i!==this.selected?'none':'auto';o.label.inert=this.selected>=0&&i!==this.selected;
      if(o.ripple.value>0&&o.ripple.value<1){const p=o.ripple.value;o.halo.scale.setScalar(1+p*.08);o.halo.material.opacity=(1-p)*.12;}else if(i===this.hovered){o.halo.scale.setScalar(1.01+Math.sin(t*2)*.008);}
    });
    if(!this.paused){this.paths.forEach(p=>{const phase=(t*.13+p.phase)%1;const ease=phase<.5?2*phase*phase:1-Math.pow(-2*phase+2,2)/2;p.dot.position.copy(p.curve.getPoint(ease));});if(this.particles)this.particles.rotation.y=t*.008;}
    this.animateOperation(t,dt);
    this.animateAmbient(t);
    this.updateZoneLabels();
    const focused=this.objects[this.selected];this.focusLight.intensity=focused?focused.focus.mix*8:0;
    if(focused){const focusGroup=this.selected===7&&!this.selectionOptions?.production?this.softwareOffice:focused.group;this.focusLight.position.copy(focusGroup.position).add(new THREE.Vector3(0,10,0));this.focusLight.target=focusGroup;}
    this.renderScene();
  }
  // Point d'extension / punto de carga futuro de GLB. Añade GLTFLoader de la
  // misma versión de Three.js y llama replaceEquipment(index, gltf.scene).
  replaceEquipment(index,model){const o=this.objects[index];this.pickables=this.pickables.filter(m=>m.userData.service!==index);o.equipment.clear();o.materials=[];model.traverse(mesh=>{if(!mesh.isMesh)return;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.service=index;this.pickables.push(mesh);const convert=m=>{const copy=m.clone();copy.userData.baseOpacity=copy.opacity;copy.userData.baseColor=copy.color?.clone()||new THREE.Color('white');copy.userData.baseEmissive=copy.emissiveIntensity||0;o.materials.push(copy);return copy;};mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);});o.equipment.add(model);model.userData.base=model.position.clone();model.userData.explode=new THREE.Vector3();o.anim={leds:[],fibers:[],air:[],dome:null};this.overviewPoints=null;this.resize();}

}



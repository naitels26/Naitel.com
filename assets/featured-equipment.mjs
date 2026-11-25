// Recognizable equipment at campus scale; no extra render passes or lights.
function sign(parent,text,x,y,z,width,E){
  const {THREE}=E,canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;
  const ctxScale=2;
  const ctx=canvas.getContext('2d');ctx.scale(ctxScale,ctxScale);ctx.fillStyle='#102a43';ctx.fillRect(0,0,512,96);
  ctx.fillStyle='#bfe6f6';ctx.font='600 34px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,61);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*96/512),new THREE.MeshBasicMaterial({map:texture}));
  mesh.position.set(x,y,z);parent.add(mesh);
}

export function buildStructuredCabling(parent,anim,E){
  const {THREE,M,box,cable}=E,g=new THREE.Group();g.name='structured-cabling-hub';g.position.z=7;parent.add(g);
  box(g,9.1,.14,3.1,-.3,.08,0,M.silver);
  box(g,9.1,.12,.065,-.3,.16,1.55,M.navy);
  // Two open communications racks: numbered copper panels and optical distribution.
  for(const [x,type] of [[.1,'CAT6A / MDF'],[2.1,'FIBER / ODF']]){
    box(g,1.48,.12,1.2,x,.22,0,M.dark);box(g,1.48,.1,1.2,x,3.05,0,M.navy);
    for(const dx of [-.66,.66])for(const z of [-.5,.5])box(g,.075,2.8,.075,x+dx,1.65,z,M.navy);
    box(g,1.25,2.65,.045,x,1.65,-.5,M.dark);
    for(const dx of [-.55,.55])box(g,.09,2.35,.12,x+dx,1.63,.57,M.dark);
    for(let row=0;row<4;row++){
      const y=2.55-row*.47;box(g,1.1,.18,.65,x,y,0,M.navy);box(g,1.13,.09,.12,x,y-.18,.58,M.dark);
      for(let port=0;port<8;port++){
        const px=x-.44+port*.125;
        box(g,.085,.07,.035,px,y,.345,M.silver);
        box(g,.057,.043,.018,px,y,.369,M.dark);
        box(g,.027,.011,.015,px,y-.021,.382,type.startsWith('CAT')?M.cableBlue:M.cableOrange);
        if(port===7)box(g,.018,.012,.018,px+.055,y,.371,M.green);
      }
      for(const side of [-1,1]){
        const px=x+side*.19;
        box(g,.05,.06,.09,px,y,.41,type.startsWith('CAT')?M.cableBlue:M.cableOrange);
        const jumper=cable(g,[[px,y,.46],[px,y-.12,.72],[x+side*.47,y-.12,.72],[x+side*.47,y-.3,.6]],.014,type.startsWith('CAT')?M.cableBlue:M.cableOrange);
        jumper.spark='patch';jumper.flashSize=.2;jumper.flashColor=type.startsWith('CAT')?'#c3efff':'#ffe0b1';anim.fibers.push(jumper);
      }
      // Neat service loops stay inside the vertical managers.
      for(const side of [-1,1])cable(g,[[x+side*.28,y,.39],[x+side*.28,y-.2,.64],[x+side*.49,y-.2,.64],[x+side*.49,y-.35,.54]],.014,type.startsWith('CAT')?M.cableBlue:M.cableOrange);
    }
    sign(g,type,x,2.88,.57,1.14,E);
    box(g,1.1,.28,.72,x,.5,.02,M.white);
  }
  // Raised tray, grouped copper/fiber runs, and a real endpoint instead of loose wires.
  for(const z of [-.22,.22])box(g,7.1,.1,.045,-.4,3.48,z,M.silver);
  for(let x=-3.85;x<=3.1;x+=.4)box(g,.045,.035,.48,x,3.43,0,M.silver);
  for(const x of [-3.8,3.05])box(g,.065,3.2,.065,x,1.8,0,M.silver);
  box(g,.8,1.95,.09,-3.5,1.2,.12,M.white);
  for(const dx of [-.15,.15]){box(g,.22,.25,.055,-3.5+dx,1.7,.2,M.silver);box(g,.11,.08,.04,-3.5+dx,1.73,.25,M.dark);}
  sign(g,'RJ45 / DATA',-3.5,2.05,.19,.7,E);
  for(let lane=0;lane<6;lane++){
    const z=-.15+lane*.06,end=lane<3?.1:2.1;
    const route=cable(g,[[-3.5,1.7,.28],[-3.5,3.56,z],[end,3.56,z],[end,2.7,z]],.019,lane<3?M.cableBlue:M.cableOrange);
    route.spark='trunk';route.flashSize=.42;route.flashColor=lane<3?'#c3efff':'#ffe0b1';
    anim.fibers.push(route);
  }
  sign(g,'STRUCTURED CABLING',-.3,.25,1.57,4.2,E);
  // Copper and fiber identification bands, with restrained status lights.
  for(const x of [-2.2,-.9,1.2])box(g,.045,.08,.4,x,3.57,0,M.dark);
  return g;
}

export function buildMeetingRoom(parent,E){
  const {THREE,M,box,cylinder,sphere,cable}=E,g=new THREE.Group();g.name='meeting-room';g.position.set(-15,3.2,8);parent.add(g);
  // Displays, a camera/speaker bar, microphones and tabletop control.
  for(const x of [-1.27,1.27]){
    box(g,2.4,1.38,.12,x,1.65,-2.16,M.navy);box(g,2.23,1.22,.035,x,1.65,-2.08,M.screen);
    for(const dx of [-.64,0,.64]){box(g,.56,.64,.02,x+dx,1.72,-2.055,M.blue);sphere(g,.105,x+dx,1.85,-2.02,M.silver);box(g,.27,.2,.025,x+dx,1.57,-2.02,M.navy);}
  }
  box(g,1.4,.18,.18,0,.78,-1.96,M.dark);sphere(g,.06,0,.79,-1.84,M.cableBlue);
  for(const x of [-.5,.5])box(g,.28,.09,.025,x,.79,-1.855,M.silver);
  box(g,4.7,.12,1.55,0,.92,.4,M.silver);
  for(const x of [-1.8,1.8])box(g,.12,.8,1.1,x,.46,.4,M.navy);
  for(const x of [-1.5,0,1.5])for(const z of [-.84,1.65]){
    box(g,.66,.14,.6,x,.52,z,M.navy);box(g,.66,.63,.1,x,.84,z+(z>0?.28:-.28),M.navy);
    cylinder(g,.05,.45,x,.25,z,M.silver);box(g,.52,.04,.45,x,.05,z,M.silver);
  }
  for(const x of [-1.15,1.15]){cylinder(g,.14,.05,x,1.01,.4,M.dark);cylinder(g,.09,.055,x,1.03,.4,M.silver);}
  const control=box(g,.44,.06,.3,0,1.02,.65,M.dark);control.rotation.x=.18;box(g,.34,.018,.22,0,1.06,.65,M.cableBlue);
  cable(g,[[0,.98,.4],[0,.22,.4],[0,.22,-1.95],[0,.75,-1.95]],.02,M.cableBlue);
  sign(g,'VIDEO / AUDIO / COLLABORATION',0,2.58,-2.07,3.8,E);
  return g;
}

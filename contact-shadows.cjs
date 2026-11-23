const fs=require('fs');let s=fs.readFileSync('scene.js','utf8');s=s.replace('this.buildPlatform();this.buildServices();','this.buildPlatform();this.buildServices();this.buildContactShadows();');const at=s.indexOf('  buildConnections(){');s=s.slice(0,at)+`  buildContactShadows(){
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,4,64,64,63);gradient.addColorStop(0,'rgba(0,5,15,.42)');gradient.addColorStop(1,'rgba(0,5,15,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const map=new THREE.CanvasTexture(canvas);
    const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false});this.objects.forEach(o=>{const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4,3),mat);shadow.rotation.x=-Math.PI/2;shadow.position.set(o.base.x,.045,o.base.z);this.world.add(shadow);});
  }
`+s.slice(at);fs.writeFileSync('scene.js',s);

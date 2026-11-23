const fs=require('fs');let s=fs.readFileSync('scene.js','utf8');s=s.replace('pmrem.fromScene(room,.08)','pmrem.fromScene(room,.025)');s=s.replace('equipment.children.forEach((p,j)=>','this.instanceStatic(equipment,anim);equipment.children.forEach((p,j)=>');const at=s.indexOf('  buildContactShadows(){');s=s.slice(0,at)+`  instanceStatic(root,anim){
    const dynamic=new Set([...(anim.leds||[]).map(x=>x.mesh),...(anim.flow||[]).map(x=>x.dot),...(anim.cableFlows||[]).map(x=>x.dot),...(anim.waves||[]).map(x=>x.mesh),...(anim.strobes||[]),anim.dome]);
    const parents=[];root.traverse(p=>{if(p.children.length)parents.push(p);});
    for(const parent of parents){const groups=new Map();for(const mesh of parent.children){if(!mesh.isMesh||mesh.isInstancedMesh||dynamic.has(mesh)||Array.isArray(mesh.material))continue;const key=mesh.geometry.uuid+mesh.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);}
      for(const meshes of groups.values()){if(meshes.length<4)continue;const first=meshes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);meshes.forEach((m,i)=>{m.updateMatrix();batch.setMatrixAt(i,m.matrix);parent.remove(m);});batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.computeBoundingSphere();parent.add(batch);}
    }
  }
`+s.slice(at);fs.writeFileSync('scene.js',s);

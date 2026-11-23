import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/three-addons/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/three-addons/loaders/DRACOLoader.js';
import {KTX2Loader} from './vendor/three-addons/loaders/KTX2Loader.js';
export async function loadEquipment(scene,index,url){
 const draco=new DRACOLoader().setDecoderPath('./vendor/three-addons/libs/draco/gltf/');
 const ktx=new KTX2Loader().setTranscoderPath('./vendor/three-addons/libs/basis/').detectSupport(scene.renderer);
 try{const gltf=await new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx).loadAsync(url);const model=gltf.scene;
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const wrapper=new THREE.Group();model.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));wrapper.add(model);wrapper.scale.setScalar(2.6/Math.max(size.y,.001));scene.replaceEquipment(index,wrapper);return wrapper;}finally{draco.dispose();ktx.dispose();}
}

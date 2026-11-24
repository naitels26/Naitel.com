// Publish only browser assets. Server code, catalogues and .env stay out of dist.
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'dist');
const files=['index.html','styles.css','service-map.css','app.js','content.js','service-map.js','brand.js','brands.js','cabling.js','scene.js','scene-details.js','model-loader.js','network-ui.js','contact.js','tour.js','tour-playback.mjs'];
async function build(){
  await import('./generate-chat-catalog.mjs');
  if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Invalid build directory');
  await fs.rm(output,{recursive:true,force:true});
  await fs.mkdir(output,{recursive:true});
  for(const file of files)await fs.copyFile(path.join(root,file),path.join(output,file));
  for(const directory of ['assets','vendor'])await fs.cp(path.join(root,directory),path.join(output,directory),{recursive:true});
  console.log('Vercel: public assets built in dist; API and catalogue remain server-only.');
}
build().catch(error=>{console.error(error);process.exitCode=1;});

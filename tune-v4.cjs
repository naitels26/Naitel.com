const fs=require('node:fs');let c=fs.readFileSync('content.js','utf8').replace('label:[1.8,.15,3.4]','label:[-1,2.8,0]');fs.writeFileSync('content.js',c);

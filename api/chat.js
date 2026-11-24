// CommonJS entry point for Vercel's Node.js runtime. Secrets stay on the server.
const {createApi}=require('../api.cjs');
const api=createApi();
module.exports=(req,res)=>api(req,res,'/api/chat');

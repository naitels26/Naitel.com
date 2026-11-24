const {createApi}=require('../api.cjs');
const api=createApi({contactAvailable:false});
module.exports=(req,res)=>api(req,res,'/api/status');

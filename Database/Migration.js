const OperatorTbl = require('../Model/OperatorInfo');
const Model = require('mongoose')
const Migrate = async (req,res,next) =>{
    const post = req.body;
    if(post.ver === 0)
    {
    await Model.syncIndexes()
    next()
    }
    if(post.ver === 1)
    {
    await OperatorTbl.updateMany({}, {$set: {"migrate": 'NOT DONE'}});
    }
    next();
}
module.exports = Migrate;
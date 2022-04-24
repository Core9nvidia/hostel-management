const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const mySchema=new Schema({
    requestedroom:{
        type:String,
        required:true
    },
    reason:{
        type:String,
        required:true
    }
},{timestamps:true});

const roomchange= mongoose.model('roomChangeRequest',mySchema);
module.exports=roomchange;
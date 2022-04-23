const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const mySchema=new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required:true
    },
    rollnumber:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        rquired:true
    },
    hmc:{
        type:Boolean,
        default:false
    }
});

const user= mongoose.model('user',mySchema);
module.exports=user;
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const mySchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"hosteluser"
    }
},{timestamps:true});

const dues= mongoose.model('due',mySchema);
module.exports=dues;
const { Int32 } = require('mongodb');
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
    password:{
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
    },
    breakfastDiet:{
        type: Number,
        default: 0
    },
    lunchDiet:{
        type: Number,
        default: 0
    },
    dinnerDiet:{
        type: Number,
        default: 0
    },
    dues:[{
        type:Schema.Types.ObjectId,
        ref:"due"
    }],
    requestedroom:{
        type:String,
        default:""
    },
    reasonOfRoomChange:{
        type:String,
        default:""
    }
    
});

const authUser= mongoose.model('hosteluser',mySchema);
module.exports=authUser;
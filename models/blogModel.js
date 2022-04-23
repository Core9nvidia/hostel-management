const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const mySchema=new Schema({
    title:{
        type:String,
        required:true,
        default:"Title"
    },
    snippet:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    }
},{timestamps:true});

const blog= mongoose.model('blog',mySchema);
module.exports=blog;
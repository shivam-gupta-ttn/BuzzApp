const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
   
    userId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        max:500
    },
    likes:{
        type:Array,
        default:[]
    },
    comments:[{
        comment:{type:String,max:500,required:false},
        commentedBy:{type:String}
    }]
},
{timestamps:true}
);

module.exports = mongoose.model("Post",PostSchema);
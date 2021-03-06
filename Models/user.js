const mongoose = require('mongoose');


const Schema = mongoose.Schema

const UserSchema = Schema({
    username : {
        type : "String",
        unique : true,
        required : true,
    },
    email : {
        type : "String",
        unique : true,
        required : true
    },
    password : {
        type : "String",
        required : true
    },
   
    posts : [
        { type: Schema.Types.ObjectId, ref: 'Post' }
    
    ]


},{
    timestamps: true,  
}) 


module.exports = mongoose.model("User", UserSchema);
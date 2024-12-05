const mongoose=require('mongoose');
const CategorySchema=new mongoose.Schema({
   name:{
    type:String,
    required:true,
    unique:true,
   },
   description:{
    type:String,
    required:true
   },
   isListed:{
    type:Boolean,
    required:true,
     default:true,
   },
   image: { 
      type: String, 
      required: false
    },
   createdAt:{
   type:Date,
   default:Date.now
   }

});
const Category=mongoose.model("Category",CategorySchema);
module.exports=Category;
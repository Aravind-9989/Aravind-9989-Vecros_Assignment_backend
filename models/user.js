const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    quiz_scores:[{
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'quizs',
        },
        score: {
          type: Number,
          required: true,
        },
        attemptedAt: {
          type: Date,
          default: Date.now,
        },
      },],
      created_at:{
        type:Date,
        default:Date.now
        }
})
const User=mongoose.model("User",userSchema);
module.exports=User;
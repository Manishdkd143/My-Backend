import mongoose,{Schema} from "mongoose";
const SubscriptionSchema=new Schema({
    subscriber:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
})
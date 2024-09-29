const mongoose=require("mongoose");

const emailSchema=new mongoose.Schema({
    from:{
        type:String,
        required:[true,"this field is required"],
        lowercase:true,
        trim:true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid Email Format"],

    },
    to:{
        type:String,
        required:[true,"this field is required"],
        lowercase:true,
        trim:true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid Email Format"],

    },
    subject:{
        type:String
    },
    text: { type: String }, // To store OTP
  html: { type: Date } // To store OTP expiration time
},{timestamps:true});

const EmailSchema=mongoose.model("email",emailSchema);

module.exports=EmailSchema;
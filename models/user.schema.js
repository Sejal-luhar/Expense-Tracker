const mongoose=require("mongoose");
const expenseSchema=require("../models/expense.schema")
const plm=require("passport-local-mongoose");

const userSchema=new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is Required"],
        minLength: [3, "Username must be atleast 3 characters long"],
        maxLength: [15, "Username must not exceed more than 15 characters"],
        trim: true,
    },
    password: String,
    email: {
        type: String,
        required: [true, "Email is Required"],
        lowercase: true,
        trim: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid Email Format"],
    },
    avatar: {
        type: Object,
        default:{
            fileId:"",
            url:"/images/default.avif",
            thumbnailUrl:"/images/default.avif"
        }
    },
    expenses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"expense"
        }
    ]
},{timestamps:true});

userSchema.plugin(plm);
const UserSchema =mongoose.model("user",userSchema);

module.exports=UserSchema;
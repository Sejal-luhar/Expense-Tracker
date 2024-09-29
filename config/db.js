const mongoose=require("mongoose")

mongoose.connect(`${process.env.MONGOURL}expense`)
.then(()=>{
    console.log("database connected successfully");
    
})
.catch((error)=>{
    console.log(error.message);
    
})
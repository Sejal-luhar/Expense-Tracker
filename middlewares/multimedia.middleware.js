
const multer=require("multer");
const path=require("path");

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/images")
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}${path.extname(file.originalname)}`);
    }
})

const fileFilter=(req,file,cb)=>{
    const filetype=/jpeg|jpg|png|svg|webp|gif|avif/;
    const mimetype=filetype.test(file.mimetype);
    const extname=filetype.test(path.extname(file.originalname).toLowerCase());
    if(mimetype && extname){
        cb(null,true)
    }
    else{
        cb(new error("file not supported",false))
    }
}
const upload=multer({
    storage:storage,
    fileFilter:fileFilter
})
module.exports=upload;
const express=require("express");
const client = require("../config/cache");
const imagekit=require("../config/imagekit")
const router=express.Router();

router.get("/",(req,res)=>{
    res.render("index",{tittle:"Expense Tracker | Homepage",
        user:req.user
    });
})
router.get("/about",(req,res,next)=>{
    res.render("about",{tittle:"Expense Tracker | About",
        user:req.user
    })
})
router.get("/createsession",(req,res,next)=>{
    req.session.expenselogin=true;
    res.status(201).json({message:"session created"})
})

router.get("/checksession",(req,res,next)=>{
   if (req.session.expenselogin) {
      res.status(200).json({message:"session active"})
   } else {
      res.status(500).json({message:"session inactive"})
   }
})
router.get("/destroysession",(req,res,next)=>{
    req.session.destroy();
    res.status(201).json({message:"session destroyed"})
})
router.get("/createcookie", function (req, res, next) {
    res.cookie("expenselogin", true, {
        maxAge: 20000,
        secure: true,
        httpOnly: true,
    });
    res.status(200).json({ message: "Cookie Created" });
});
router.get("/checkcookie", function (req, res, next) {
    // console.log(req.cookies);
    if (req.cookies.expenselogin) {
        res.status(200).json({ message: "Cookie Active" });
    } else {
        res.status(200).json({ message: "Cookie Inactive" });
    }
});
 router.get("/destroycookie",(req,res,next)=>{
    res.clearCookie("expenselogin");
    res.status(201).json({message:"cookie destroyed"})
})
router.get("/createflash",(req,res,next)=>{
    req.flash("info","flash message created")
    res.status(200).json({message:"flash message created"})
})
router.get("/checkflash",(req,res,next)=>{
    // console.log(req.flash());
    res.status(200).json({message:"flash active"})
    
})
router.get("/destroyflash",(req,res,next)=>{
    req.flash("info");
    res.status(201).json({message:"flash message destroyed"})
})
router.post("/createcache",(req,res)=>{
//    client.set("user:profile:12345",
//     JSON.stringify("bahut impotant data")
//    );
client.setEx("user:profile:12345",10,
    JSON.stringify("bahut impotant data")
   );
   res.status(200).json({message:"cache created "})
})
router.get("/getcache",async(req,res)=>{
    const data=await client.get("user:profile:12345");
    res.status(200).json({message:"cache Retriewed",
        data:JSON.parse(data),
    })
})
router.get("/delcache",async(req,res)=>{
    await client.del("user:profile:12345");
    res.status(200).json({message:"cache deleted"})
})
router.post("/imagekit",async(req,res,next)=>{
    try {
      res.status(200).json({
        message:"image uploded",
        res:req.files[0].avatar,
      })
    } catch (error) {
      next(error);
    }
  })
  router.get('/about', (req, res) => {
    res.render('about'); // Render the about.ejs template
});
module.exports=router;
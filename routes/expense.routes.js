const express=require("express")

const router=express.Router();
const {isLoggedIn}=require("../middlewares/auth.middleware")
const expenseSchema=require("../models/expense.schema");
const UserSchema = require("../models/user.schema");

router.get("/create",isLoggedIn,(req,res)=>{
    res.render("createexpense",{title:"Expense Tracker | Create Expense",
        user:req.user}
    )
})
router.post("/create",isLoggedIn,async(req,res,next)=>{
    try {
        const newexpense=new expenseSchema(req.body)
         newexpense.user=req.user._id;
        await newexpense.save();
        // req.user.expenses.push(newexpense._id);
        // await req.user.save();

        const currentUser = await UserSchema.findOne({username:req.user.username})
        currentUser.expenses.push(newexpense._id)
        await currentUser.save();
        res.redirect("/expense/show")
    } catch (error) {
       next(error.message)
    }
})

router.get("/show",isLoggedIn,async(req,res,next)=>{
    try {
        // const expenses=await expenseSchema.find(req.body);
        res.render("showexpense.ejs",{title:"Expense Tracker | Show Expenses",
            // expenses:expenses,
            // user:req.user,
            user: await UserSchema.findOne({username:req.user.username}).populate("expenses"),
        })
    } catch (error) {
        next(error.message)
    }
})
router.get("/details/:id",isLoggedIn,async(req,res,next)=>{
    try {
        const expenseDet=await expenseSchema.findById(req.params.id);
        res.render("showexpensedetails",{title:"Expense Tracker | Expense Details",
            expenseDet:expenseDet,
            user:req.user
        })
    } catch (error) {
        next(error.message)
    }
})
router.get("/delete/:id",async(req,res,next)=>{
    try {
        await expenseSchema.findByIdAndDelete(req.params.id);
        const deletedExpense=await expenseSchema.findByIdAndDelete(req.params.id);
        await req.user.expenses.pull(deletedExpense._id);
        await req.user.save();
        res.redirect("/expense/show");
    } catch (error) {
        next(error.message)
    }
})
router.get("/update/:id",isLoggedIn,async(req,res,next)=>{
    try {
        const expenseEdit=await expenseSchema.findById(req.params.id);
        res.render("updateexpense",{title:"Expense Tracker | Update Expense",
            expenseEdit:expenseEdit,
            user:req.user
        })
    } catch (error) {
        next(error.message);
    }
})
router.post("/update/:id", async (req, res) => {
    try {
        await expenseSchema.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/expense/details/" + req.params.id);
    } catch (error) {
        next(error);
    }
});

module.exports=router;
const express = require("express");
const router = express.Router();
const fs = require("fs");

const userSchema = require("../models/user.schema");
const emailSchema=require("../models/email.schema")
const { isLoggedIn } = require("../middlewares/auth.middleware");
const imagekit=require("../config/imagekit")
const client=require("../config/cache")

const passport = require("passport");
const localStrategy = require("passport-local");
// const { log } = require("console");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const sendEmail = require("../config/email");
const UserSchema = require("../models/user.schema");

passport.use(new localStrategy(userSchema.authenticate()));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Here you can save the user profile to your database
      return done(null, profile);
    }
  )
);

router.get("/singnup", async (req, res) => {
  res.render("singnup", {
    title: " Expense Tracker | Signup Page",
    user: req.user,
  });
});

router.post("/singnup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    await userSchema.register({ username, email }, password);
    res.redirect("/user/signin");
  } catch (error) {
    next(error.message);
  }
});
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    // console.log("req => ", req.query);
    return next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    const isUserAlreadyExist = await userSchema.findOne({
      email: req.user.emails[0].value,
    });

    if (isUserAlreadyExist) {
      req.login(isUserAlreadyExist, (err) => {
        if (err) {
          return next(err);
        }
      });
      return res.redirect("/user/profile");
    }

    const newUser = await userSchema.create({
      username: req.user.displayName,
      email: req.user.emails[0].value,
      avatar: req.user.photos[0].value,
    });

    await newUser.save();
    // console.log(newUser);
    
    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
    });

    res.redirect("/user/profile");
  }
);
router.get("/signin", async (req, res) => {
  res.render("signin", {
    title: "Expense Tracker | Signin page",
    user: req.user,
  });
});

// router.post("/signin",passport.authenticate("local"),async(req,res)=>{
//     try {
//         res.redirect("/user/profile")
//     } catch (error) {
//         next(error)
//     }
// })

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/signin",
  }),
  (req, res) => {}
);

router.get("/profile", isLoggedIn, async (req, res,next) => {
  try {
    sendEmail(
        'sumitluhar2004@gmail.com',
        'welcome to m11-server',
        '',
        `<h1>hello from server</h1>`      );
    // console.log(req.user);
    if(req.user.emails){
      const user=await userSchema.findOne({email:req.user.emails[0].value});

      res.render("profile", {
        title: "Expense Tracker | Profile Page",
        user,
      });
    }
   
    else{
      res.render("profile", {
        title: "Expense Tracker | Profile Page",
        user: req.user,
      });
    }
    
    console.log(req.user);
  } catch (error) {
    next(error);
  }
});
router.get("/signout", isLoggedIn, async (req, res) => {
  req.logOut(() => {
    res.redirect("/user/signin");
  });
});

router.get("/resetpassword", isLoggedIn, async (req, res) => {
  res.render("resetPassword", {
    title: "Expense Tracker | Reset Password",
    user: req.user,
  });
});

router.post("/resetpassword", isLoggedIn, async (req, res) => {
  try {
    await req.user.changePassword(req.body.oldpassword, req.body.newpassword);
    await req.user.save();
    res.redirect("/user/signin");
  } catch (error) {
    next(error);
  }
});

router.get("/deleteaccount", isLoggedIn, async (req, res, next) => {
  try {
    await userSchema.findByIdAndDelete(req.user);
    res.redirect("/user/signin");
  } catch (error) {
    next(error);
  }
});

router.get("/update", isLoggedIn, async (req, res,next) => {
  console.log('hello')
  res.render("updateUser", {
    title: "Expense Tracker | Update User Details",
    user: req.user,
  });
});

router.post("/update", isLoggedIn, async (req, res, next) => {
  try {
    await userSchema.findByIdAndUpdate(req.user._id, req.body);
    res.redirect("/user/profile");
  } catch (error) {
    next(error);
  }
});

router.post("/avatar", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = await UserSchema.findOne({ _id: req.user._id });

    // Check if there's an existing avatar to delete
    if (currentUser.avatar.fileId) {
      await imagekit.deleteFile(currentUser.avatar.fileId);
    }

    // Log before the upload process starts
    console.log("image upload about to run");

    // Log the file information to debug file upload issues
    if (!req.files || !req.files.avatar) {
      throw new Error("File upload failed: No file provided");
    }

    console.log("File information:", req.files.avatar);

    // Upload the new avatar to ImageKit
    const result = await imagekit.upload({
      file: req.files.avatar.data,
      fileName: req.files.avatar.name,
    });

    // Log after successful image upload
    console.log("image upload done");

    // Extract result details and update user
    const { fileId, url, thumbnailUrl } = result;
    currentUser.avatar = { fileId, url, thumbnailUrl };

    // Save the updated user information
    await currentUser.save();
    req.user= currentUser

    // Redirect after the operation is complete
    res.redirect("/user/update");

  } catch (error) {
    // Log the error to understand what went wrong
    console.error("Error during avatar upload:", error);
    next(error); // Pass the error to the error-handling middleware
  }
});


// router.post(
//   "/avatar",
//   isLoggedIn,
//   upload.single("avatar"),
//   async (req, res, next) => {
//     try {
//       // console.log(req.user);

//       if (
//         req.user.avatar != "default.avif" &&
//         fs.existsSync(`public/images/${req.user.avatar}`)
//       ) {
//         fs.unlinkSync(`public/images/${req.user.avatar}`);
//       }
//       req.user.avatar = req.file.filename;
//       // await req.user.save();
//       res.redirect("/user/update");
//     } catch (error) {
//       next(error);
//     }
//   }
// );

router.get("/forget-password", async (req, res) => {
  res.render("forgetpassword_email", {
    title: "Expense Tracker | Forget Password",
    user: req.user,
  });
});
router.post("/forget-password", async (req, res, next) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) return next(new Error("user not found"));
    const otp=Math.round(Math.random()*10000);
    // send email to user with OTP
    sendEmail(
      user.email,
      'welcome to m11-server',
      '',
      `<h1>your onetime otp is ${otp}</h1>`      );
    // and save the same OTP in database==
    await client.set("user:otp:1234",JSON.stringify(otp))
    res.redirect(`/user/forget-password/${user._id}`);
  } catch (error) {
    next(error);
  }
});
router.get("/forget-password/:id", async (req, res) => {
  res.render("forgetpassword_otp", {
    title: "EXpense Tracker |Forget Password",
    user: req.user,
    id: req.params.id,
  });
});
router.post("/forget-password/:id", async (req, res, next) => {
  try {
    const user = await userSchema.findById(req.params.id);
    // compare the req.body.otp with the otp in database
    const otp=await client.get("user:otp:1234")
    if(req.body.otp== JSON.parse(otp)){

    // if matched redirect to password page else ERROR
    res.redirect(`/user/set-password/${user._id}`);
    }
    else{
      console.log("invalid otp");
      
    }
  } catch (error) {
    next(error);
  }
});
router.get("/set-password/:id", async (req, res) => {
  res.render("forgetpassword_password", {
    title: "Expense Tracker | Set Password",
    user: req.user,
    id: req.params.id,
  });
});
router.post("/set-password/:id", async (req, res, next) => {
  try {
    const user = await userSchema.findById(req.params.id);
    await user.setPassword(req.body.password);
    user.otp=undefined;
    await user.save();
    res.redirect("/user/signin");
  } catch (error) {
    next(error);
  }
});
module.exports = router;

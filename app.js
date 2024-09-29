require("dotenv").config({path:"./.env"})
const express=require("express")
const app=express();
const path=require("path");

var createError = require('http-errors');
require("./config/db");
const cookieParser=require("cookie-parser")
const flash=require("connect-flash")
const fileUpload=require("express-fileupload")
const indexRouter=require("./routes/index.routes")
const expenseRouter=require("./routes/expense.routes");
const userRouter=require("./routes/user.routes")
const passport = require("passport");
const session=require("express-session")


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));

app.use(fileUpload());

app.use(session({
    secret:process.env.EXPRESS_SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
      maxAge:1000*60*60*24*2
    }
}))

app.use(passport.initialize())
app.use(passport.session());
passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

app.use(flash());

app.use("/",indexRouter);
app.use("/expense",expenseRouter);
app.use("/user",userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  
  module.exports = app;
  
if (process.env.NODE_ENV !== "production") { 
 require("dotenv").config();
}
console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose =  require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const user = require("./models/user.js");
const localStrategy = require("passport-local");
const UserRouter = require("./routes/user.js");
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");



//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
   .then(()=>{
    console.log("connected to DB");
   })
   .catch((err)=>{
    console.log(err);
   });

async function  main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
//y mane add kiya h chatgpt  
app.use(express.json());


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
}); 

store.on("error", (err) => {
  console.log("ERROR in SESSION STORE", err);
});
  
const sessionOptions = {
    store,
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};
 

app.use(session(sessionOptions));
app.use(flash());
  
app.use(passport.initialize());
app.use(passport.session());  
passport.use(new localStrategy(user. authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success"); 
    res.locals.error= req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

//app.get("/demouser", async (req, res, next)=>{
  //  let fakeuser =new user({
    //    email: "studentgmail.com",
    //    username:  "student",
    //});
    //let registereduser = await user.register(fakeuser,"elloworld");
    //res.send(registereduser);
//});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", UserRouter);

//app.get("/", (req, res) =>{
  //  res.send("Hii i am root");
//});


 app.all("*", (req, res, next)=>{
  next(new ExpressError("page not found", 404));
 });
app.use((err, req, res, next)=>{
  let{message= "something went wrong", statusCode= 500} = err;
  res.status(statusCode).render("error.ejs",{message});
});
// Purane 'app.listen' ki jagah ye replace kara:
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;


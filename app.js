if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//run for error
//NODE_ENV=production node app.js

//console.log(process.env.CLOUDINARY_CLOUD_NAME);
//console.log(process.env.CLOUDINARY_KEY);
//console.log(process.env.CLOUDINARY_SECRET); image pexel
//https://res.cloudinary.com/hamad/image/upload/w_100/v1643133677/Campsite/ydwzy58ikz8bklifqlmc.jpg
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localstrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");
const nodemailer = require("nodemailer");
const mongosanitize = require("express-mongo-sanitize");

const usersroutes = require("./routes/users");
const campgroundsroutes = require("./routes/campgrounds");
const reviewsroutes = require("./routes/reviews");

//const dburl = process.env.DB_URL;
//"mongodb://localhost:27017/camp"
//const MongoStore = require("connect-mongo");

const dburl = process.env.DB_URL || "mongodb://localhost:27017/camp";

mongoose.connect(dburl, {
  useNewUrlParser: true,
  //useCreateIndex: true,
  useUnifiedTopology: true,
  //useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});
const app = express();
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongosanitize({
    replaceWith: "_",
  })
);

// session config

const secret = process.env.SECRET || "this is my secret";

const sessionconfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // miliseconds  seconds minutes hours days
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionconfig));
app.use(flash());
/*
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/hamad/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
*/

// mail api

app.post("/contact", function (req, res) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "hammadbabar1700@gmail.com", // this should be YOUR GMAIL account
      pass: "eflznqqgvhdxdpdv", // this should be your password
    },
  });
  var textBody = `FROM: ${req.body.name} EMAIL: ${req.body.email} CNIC: ${req.body.cnic} PHONENO: ${req.body.phoneno} ARRIVAL: ${req.body.arrival} BOOKING: ${req.body.booking}`;
  var htmlBody = `<h2> Mail From  Campsite </h2><p>from:<a href="mailto:${req.body.email}">${req.body.email}</a></p><h3>NAME:</h3><p>${req.body.name}</p><h3>CNIC:</h3><p>${req.body.cnic}</p><h3>PHONE NO:</h3><p>${req.body.phoneno}</p><h3>ARRIVAL DATE:</h3><p>${req.body.arrival}</p><h3>BOOKING CAMPGROUND PLACE:</h3><p>${req.body.booking}</p>`;
  var mail = {
    from: "hammadbabar1700@gmail.com", // sender address
    to: "hammadbabar1700@gmail.com", // list of receivers (THIS COULD BE A DIFFERENT ADDRESS or ADDRESSES SEPARATED BY COMMAS)
    subject: "Mail From Booking Campground Customer ", // Subject line
    text: textBody,
    html: htmlBody,
  };
  transporter.sendMail(mail, function (err, info) {
    if (err) {
      console.log(err);
      res.json({
        message:
          "message not sent: an error occured; check the server's console log",
      });
    } else {
      //res.json({ message: `message sent: ${info.messageId}`});
      res.redirect("/");
      //res.send(prompt("we receive your email,please wait for our reponse.we send you confirmation mail."))
    }
  });
});
app.get("/contact.ejs", function (req, res) {
  res.render("contact.ejs");
});



app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// campgrounds routes
app.use("/", usersroutes);
app.use("/campgrounds", campgroundsroutes);
app.use("/campgrounds/:id/reviews", reviewsroutes);

app.get("/", (req, res) => {
  res.render("home");
});

// all errors
app.all("*", (err, req, res, next) => {
  next(new ExpressError("page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh no, something went wrong";
  res.status(statusCode).render("error", { err });
});





app.listen(27, () => {
  console.log("app is started at port no 27");
});

var express =       require("express"),
    app =           express(),
    bodyParser =    require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    seedDB = require("./seeds"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    User = require("./models/user");

var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index")
    userRoutes = require("./routes/users");
    
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

mongoose.connect("mongodb://coma:ironmaiden1990@ds133262.mlab.com:33262/yelpcamp", {useNewUrlParser: true});
//mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// seedDB(); // seed the database
app.locals.moment = require("moment");
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Yelp Camp App",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(methodOverride("_method"));

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/users", userRoutes);


// redirect 
app.get("*", function (req, res) {
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
    console.log("YelpCamp server has started");
});
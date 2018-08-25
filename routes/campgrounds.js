var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dgpo6tawt', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// ==================================================================
// CAMPGROUNDS ROUTES
// ==================================================================
router.get("/", function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                if(allCampgrounds.length < 1) {
                    req.flash("error", "Campground no found");
                    return res.redirect("/campgrounds");
                } else {
                    res.render("campgrounds/index", { campgrounds: allCampgrounds , currentUser: req.user, page: 'campgrounds'});
                }
            }
        });    
    } else {
        // Get all campgrounds form DB
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", { campgrounds: allCampgrounds , currentUser: req.user, page: 'campgrounds'});
            }
        });
    }
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    var campgroundName = req.body.name;
    var campgroundImage = req.body.image;
    var campgroundPrice = req.body.price;
    var campgroundDescription = req.body.description;
    var campgroundAuthor = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: campgroundName, image: campgroundImage, description: campgroundDescription, author: campgroundAuthor, price: campgroundPrice, createdAt: Date.now() };
    // Create a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Campground added successfully");
            res.redirect("/campgrounds/" + newlyCreated._id);
        }
    });
    
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function (req, res) {
    // find campgrounds with provided id
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: campground});
        }
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground updated successfully");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

// DELETE CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground deleted successfully");
            res.redirect("/campgrounds");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
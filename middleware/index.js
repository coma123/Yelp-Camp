var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, campground) {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Your need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err) {
                res.redirect("back");
            } else {
                if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Your need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkProfileOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                res.redirect("/campgrounds");
            } else {
                if (user._id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that");
                    res.redirect("/campgrounds");
                }
            }
        });
    } else {
        req.flash("error", "Your need to be logged in to do that");
        res.redirect("/campgrounds");
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "Please login first!");
        res.redirect("/login");
    }
}

middlewareObj.isAdmin = function (req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, function (err, user) {
            if (err) {
                res.redirect("/campgrounds");
            } else {
                if (user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that");
                    res.redirect("/campgrounds");
                }
            }
        });
    } else {
        req.flash("error", "Your need to be logged in to do that");
        res.redirect("/campgrounds");
    }
}

module.exports = middlewareObj;
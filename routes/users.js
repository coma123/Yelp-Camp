var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var User = require("../models/user");
var middleware = require("../middleware/index");

// users profile
router.get("/all", middleware.isAdmin, function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            req.flash("error", "Users can't be found");
            res.redirect("/campgrounds");
        } else {
            res.render("users/all", {users: users});
        }
    })
});

router.get("/:id/giveAdmin", middleware.isAdmin, function (req, res) {
    var data = {
        isAdmin: true
    }

    User.findByIdAndUpdate(req.params.id, data, function (err, updatedUser) {
        if (err) {
            req.flash("error", "User can't be made as admin");
            res.redirect("/users/all");
        } else {
            req.flash("success", "User role changed as admin");
            res.redirect("/users/all");
        }
    })
});

router.get("/:id/makeSubscriber", middleware.isAdmin, function (req, res) {
    var data = {
        isAdmin: false
    }

    User.findByIdAndUpdate(req.params.id, data, function (err, updatedUser) {
        if (err) {
            req.flash("error", "Can't change user role");
            res.redirect("/users/all");
        } else {
            req.flash("success", "User role changed as subscriber");
            res.redirect("/users/all");
        }
    })
});

router.get("/:id", function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            req.flash("error", "You don't have permission to access this page");
            res.redirect("/campgrounds");
        } else {
            Campground.find().where("author.id").equals(user.id).exec(function (err, campgrounds) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("/campgrounds");
                } else {
                    res.render("users/show", {user: user, campgrounds: campgrounds});
                }
            });
       }
    });
});

router.get("/:id/edit", middleware.checkProfileOwnership, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            req.flash("error", "You dont have permission to access this page");
            res.redirect("/campgrounds");
        } else {
            res.render("users/edit", {user: user});
        }
    });
});

router.put("/:id", middleware.checkProfileOwnership, function (req, res) {
    var updatingUser = {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    };

    if (req.body.password === "") {
        User.findByIdAndUpdate(req.params.id, updatingUser, function (err, updatedUser) {
            if (err) {
                req.flash("error", "Something went wrong");
                res.redirect("/users/" + req.params.id + "/edit");
            } else {
                req.flash("success", "Profile Updated");
                res.redirect("/users/" + req.params.id);
            }
        });
    } else {
        if (req.body.password === req.body.confirm) {
            User.findOne({ _id: req.params.id }, function (err, user) {
                if (!user) {
                    req.flash("error", "User with this id does not exist");
                    res.redirect("/users/" + req.params.id + "/edit");
                } else {
                    user.setPassword(req.body.password, function (err) {
                        if (err) {
                            req.flash("error", "Password can't be set.");
                            res.redirect("/users/" + req.params.id + "/edit");
                        } else {
                            user.save(function (err) {
                                if (err) {
                                    req.flash("error", "Something went wrong");
                                    res.redirect("/users/" + req.params.id + "/edit");
                                } else {
                                    User.findByIdAndUpdate(req.params.id, updatingUser, function (err, updatedUser) {
                                        if (err) {
                                            req.flash("error", "Something went wrong");
                                            res.redirect("/users/" + req.params.id + "/edit");
                                        } else {
                                            req.flash("success", "Profile Updated");
                                            res.redirect("/users/" + req.params.id);
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
            });
        } else {
            req.flash("error", "Passwords does not match");
            res.redirect("/users/" + req.params.id + "/edit");
        }
    }
});

module.exports = router;
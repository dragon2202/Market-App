const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Cart = require('../models/Cart');

//Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
//admin
router.get('/admin', ensureAuthenticated, function (req, res) {
    if (req.user.admin == "true") {
        res.render('admin', {
        })
    } else {
        req.flash('error_msg', 'Unauthorized. You are not an Admin');
        res.redirect('customer')
    }

}
);

router.get('/customer', ensureAuthenticated, (req, res) =>
    res.render('customer', {
        user: req.user
    }));

router.get('/profile', ensureAuthenticated, function (req, res) {
    res.render('profile', {
        user: req.user
    })
  });

router.get('/cart', ensureAuthenticated, (req, res) =>
    Cart.findOne({ userId: req.user._id }, function (err, result) {
        if (result) {
            res.render('cart', {
                InvVar: result
            })
        } else {
            req.flash('error_msg', 'Please add something to the cart.');
            res.redirect('customer')
        }
    })
);
module.exports = router;


/*
router.get('/admin', ensureAuthenticated, (req, res) =>
    res.render('admin', {
    })
);
*/
const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');


router.route('/register')
.get( users.renderregisteruser)
.post( catchAsync(users.renderregister));


router.route('/login')
.get( users.renderlogin)
.post( passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginuser)

router.get('/logout', users.logoutuser)


module.exports = router;
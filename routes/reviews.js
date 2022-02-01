const express = require('express');
const router = express.Router({ mergeParams: true });
const {validateReview , isloggedin, isReviewAuthor}= require('../middleware')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const campground = require('../models/campground');
const reviews = require('../controllers/reviews')


//js validator

// reviews
router.post('/',isloggedin, validateReview, catchAsync(reviews.createreview))

router.delete('/:reviewId',isloggedin,isReviewAuthor, catchAsync(reviews.deletereview))

module.exports = router;
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const {isloggedin,isAuthor,validateCampground} = require('../middleware');
const multer = require('multer');
const {storage}= require('../cloudinary');
const upload = multer({ storage });
const Campground = require('../models/campground');

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isloggedin, upload.array('image'),validateCampground, catchAsync(campgrounds.createcampground))

// campground data

router.get('/new',isloggedin,campgrounds.renderform)


router.route('/:id')
.get( catchAsync(campgrounds.showcampground))
.put(isloggedin,isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updatecampground))
.delete(isloggedin,isAuthor, catchAsync(campgrounds.deletecampground));





//edit & update campgrounds data

router.get('/:id/edit',
isloggedin,
isAuthor,
 catchAsync(campgrounds.editcampground))



// delete campground data


module.exports = router;
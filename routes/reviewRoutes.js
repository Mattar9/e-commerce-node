const {
    getAllReviews,
    getSingleReview,
    createReview,
    deleteReview,
    updateReview
} = require('../controllers/reviewController');
const {authenticatedUser} = require('../middleware/authentication');
const express = require('express');
const router = express.Router();

router.route('/').get(getAllReviews).post(authenticatedUser,createReview)
router.route('/:id').get(getSingleReview).patch(authenticatedUser,updateReview).delete(authenticatedUser,deleteReview);

module.exports = router;
const {
    getAllProducts,
    createProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
} = require('../controllers/productController');
const {getSingleProductReviews} = require('./../controllers/reviewController');
const {authenticatedUser,authorizePermission} = require('../middleware/authentication');

const express = require('express');
const router = express.Router();

router.route('/').get(getAllProducts).post(authenticatedUser,authorizePermission('admin'), createProduct);
router.route('/uploadImage').post(authenticatedUser,authorizePermission('admin'),uploadImage)
router.route('/:id').get(getSingleProduct).patch(authenticatedUser,authorizePermission('admin'), updateProduct).delete(authenticatedUser,authorizePermission('admin'), deleteProduct)
router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router;

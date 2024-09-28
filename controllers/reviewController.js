const Review = require('../models/ReviewModel');
const Product = require('../models/ProductModel');
const {StatusCodes} = require("http-status-codes");
const customError = require("../errors");
const checkPermissions = require('../utils/checkPermissions');

const createReview = async (req, res) => {
    const {product: productId} = req.body
    const isValidProduct = await Product.findOne({_id: productId})
    if (!isValidProduct) throw new customError.NotFoundError('there is no product with this ID');
    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
    })
    if (alreadySubmitted) throw new customError.BadRequestError('Already submitted Review for this product')

    req.body.user = req.user.userId
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({success: true, review});
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find().populate('product','name company price')
    res.status(StatusCodes.OK).json({success: true, count: reviews.length, reviews});
}

const getSingleReview = async (req, res) => {
    const {id} = req.params
    const review = await Review.findOne({_id: id}).populate('product','name company price')
    if (!review) throw new customError.NotFoundError('there is no review with this ID');
    res.status(StatusCodes.OK).json({success: true, review});
}

const updateReview = async (req, res) => {
    const {id} = req.params;
    const {rating, title, comment} = req.body
    const review = await Review.findOne({_id: id})
    if (!review) throw new customError.NotFoundError('there is no review with this ID');
    checkPermissions(req.user, review.user)
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save()
    res.status(StatusCodes.OK).json({success: true,msg: 'Review successfully updated'});
}

const deleteReview = async (req, res) => {
    const {id} = req.params;
    const review = await Review.findOne({_id: id})
    if (!review) throw new customError.NotFoundError('there is no review with this ID');
    checkPermissions(req.user, review.user)
    await review.deleteOne({_id: id})
    res.status(StatusCodes.OK).json({success: true, msg: 'Review deleted'});
}

const getSingleProductReviews = async (req, res) => {
    const {id:productId} = req.params
    const reviews = await Review.find({product: productId})
    res.status(StatusCodes.OK).json({success: true,count:reviews.length, reviews});
}

module.exports = {createReview, getAllReviews, getSingleReview, updateReview, deleteReview,getSingleProductReviews}
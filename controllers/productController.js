const Product = require("../models/ProductModel");
const {StatusCodes} = require("http-status-codes");
const customError = require('../errors');
const path = require("path");

const getAllProducts = async (req, res) => {
    const products = await Product.find()
    res.status(StatusCodes.OK).json({count: products.length, success: true, products})
}

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body)

    res.status(StatusCodes.CREATED).json({success: true, product});
}

const getSingleProduct = async (req, res) => {
    const {id} = req.params
    const product = await Product.findOne({_id: id}).populate('reviews', 'rating title comment')
    if (!product) throw new customError.NotFoundError('there is no product with this id');
    res.status(StatusCodes.OK).json({success: true, product});
}

const updateProduct = async (req, res) => {
    const {id} = req.params
    const newProduct = await Product.findOneAndUpdate({_id: id}, req.body, {
        new: true,
        runValidators: true,
    })
    res.status(StatusCodes.OK).json({success: true, msg: "Product updated successfully."});
}

const deleteProduct = async (req, res) => {
    const {id:productId} = req.params
    const product = await Product.findOne({_id: productId})
    if (!product) throw new customError.NotFoundError('there is no product with this id');
    await product.deleteOne()
    res.status(StatusCodes.OK).json({success: true, msg: 'Product deleted successfully.'});
}

const uploadImage = async (req, res) => {
    const productImage = req.files.image
    if (!productImage) throw new customError.BadRequestError('please upload an image for product');
    if (!productImage.mimetype.includes('image/')) throw new customError.BadRequestError('please upload an image');
    const maxSize = 1024 * 1024
    if (productImage.size > maxSize) {
        throw new customError.BadRequestError('please upload an image smaller than 1mb');
    }
    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({success: true, image: '/uploads/' + `${productImage.name}`});
}

module.exports = {getAllProducts, getSingleProduct, createProduct, updateProduct, deleteProduct, uploadImage}
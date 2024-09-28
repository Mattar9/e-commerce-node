const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const {StatusCodes} = require("http-status-codes");
const customError = require("../errors");
const checkPermissions = require('../utils/checkPermissions');

const fakePaymentStripe = async ({totalAmount, currency}) => {
    const client_secret = 'some Random Value'
    return {client_secret, totalAmount}
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find()
    res.status(StatusCodes.OK).json({success: true, count: orders.length, orders})
};

const createOrder = async (req, res) => {
    const {items: cartItems, tax, shippingFee} = req.body
    if (!cartItems || cartItems.length < 1) {
        throw new customError.BadRequestError('no cart item provided');
    }
    if (!tax || !shippingFee) {
        throw new customError.BadRequestError('please provide tax and shipping fee');
    }
    let orderItems = []
    let subtotal = 0

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({_id: item.product})
        if (!dbProduct) {
            throw new customError.NotFoundError('no product with id ' + item.product);
        }
        const {name, price, image, _id} = dbProduct
        const singleOrderItem = {
            amount: item.amount,
            name, price, image, product: _id
        }

        orderItems = [...orderItems, singleOrderItem];
        subtotal += singleOrderItem.amount * price;
    }
    const total = shippingFee + tax + subtotal
    const paymentIntent = await fakePaymentStripe({
        totalAmount: total, currency: 'usd'
    })

    const order = await Order.create({
        orderItems, total, subtotal, tax, shippingFee, clientSecret: paymentIntent.client_secret, user: req.user.userId
    })

    res.status(StatusCodes.CREATED).json({order, clientSecret: order.clientSecret})
}

const getSingleOrder = async (req, res) => {
    const {id} = req.params
    const order = await Order.findOne({_id: id})
    if (!order) {
        throw new customError.NotFoundError('no order with id ' + id)
    }

    checkPermissions(req.user,order.user)

    res.status(StatusCodes.OK).json({success: true, order})
}

const updateOrder = async (req, res) => {
    const {id} = req.params
    const {paymentIntentId} = req.body
    const order = await Order.findOne({_id: id})
    if (!order) {
        throw new customError.NotFoundError('no order with id ' + id)
    }
    checkPermissions(req.user,order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()
    res.status(StatusCodes.OK).json({success: true, order})
}

const deleteOrder = async (req, res) => {
    res.send('delete order');
}

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({user: req.user.userId})
    res.status(StatusCodes.OK).json({success: true, count: orders.length, orders})
}

module.exports = {
    getAllOrders, createOrder, getSingleOrder, updateOrder, deleteOrder, getCurrentUserOrders
}


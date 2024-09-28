const express = require('express');
const {
    getAllOrders,
    getSingleOrder,
    updateOrder,
    createOrder,
    deleteOrder,
    getCurrentUserOrders
} = require('../controllers/orderController')
const {authenticatedUser, authorizePermission} = require('../middleware/authentication');
const router = express.Router();

router.route('/').get(authenticatedUser, authorizePermission('admin'), getAllOrders).post(authenticatedUser, createOrder)
router.route('/showAllMyOrders').get(authenticatedUser, getCurrentUserOrders)
router.route('/:id').get(authenticatedUser, getSingleOrder).patch(authenticatedUser, updateOrder).delete(authenticatedUser, deleteOrder)

module.exports = router
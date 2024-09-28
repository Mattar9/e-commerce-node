const express = require('express');
const {authenticatedUser,authorizePermission} = require('../middleware/authentication');
const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('./../controllers/userController')
const router = express.Router();

router.route('/').get(authenticatedUser,authorizePermission('admin','owner'),getAllUsers)
router.route('/showMe').get(authenticatedUser,showCurrentUser)
router.route('/updateUser').patch(authenticatedUser,updateUser);
router.route('/updateUserPassword').patch(authenticatedUser,updateUserPassword);

router.route('/:id').get(authenticatedUser,getSingleUser)

module.exports = router;
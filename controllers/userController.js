const User = require('../models/UserModel');
const {StatusCodes} = require("http-status-codes");
const customError = require("../errors");
const {attachCookiesToResponse} = require('../utils/jwt');
const createTokenUser = require('../utils/createTokenUser');
const checkPermissions = require('../utils/checkPermissions');

const getAllUsers = async (req, res) => {
    const users = await User.find({role: 'user'}).select('-password')
    console.log(req.user);
    res.status(StatusCodes.OK).json({success: true, data: users});
}

const getSingleUser = async (req, res) => {
    const {id} = req.params
    const user = await User.findById(id).select('-password')
    if (!user) throw new customError.NotFoundError('there is no user with this id');
    checkPermissions(req.user,user._id)

    res.status(StatusCodes.OK).json({success: true, user: user});
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({success: true, user: req.user});
}

const updateUser = async (req, res) => {
    const {name, email} = req.body
    if (!name || !email) {
        throw new customError.BadRequestError('name and email is required');
    }
    const updatedUser = await User.findOneAndUpdate({_id:req.user.userId}, {name, email},{
        new: true,
        runValidators: true,
    })
    const tokenUser = createTokenUser(updatedUser)
    attachCookiesToResponse(res, tokenUser)
    res.status(StatusCodes.OK).json({success: true, user:tokenUser});
}

const updateUserPassword = async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new customError.BadRequestError('oldPassword,newPassword,confirmPassword is required');
    }
    if (newPassword !== confirmPassword) {
        throw new customError.BadRequestError('newPassword and confirmPassword must match');
    }
    const user = await User.findOne({_id: req.user.userId})

    const matchPassword = await user.comparePassword(oldPassword)
    if (!matchPassword) {
        throw new customError.UnauthenticatedError('password is wrong');
    }
    user.password = newPassword
    await user.save()

    res.status(StatusCodes.OK).json({success: true, msg: 'successfully updated password'});
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUserPassword,
    updateUser
}
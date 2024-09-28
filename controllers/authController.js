const User = require('../models/UserModel');
const {StatusCodes} = require("http-status-codes");
const customError = require('../errors');
const {attachCookiesToResponse} = require('../utils/JWT');
const UnauthenticatedError = require("../errors/unauthenticated");
const {token} = require("morgan");
const createTokenUser = require('../utils/createTokenUser')

const register = async (req, res) => {
    const {email, password, name} = req.body;

    const emailNotUnique = await User.findOne({email})

    if (emailNotUnique) {
        throw new customError.BadRequestError('email already exists');
    }

    const newUser = await User.create({name, email, password})
    const tokenUser = createTokenUser(newUser)

    attachCookiesToResponse(res, tokenUser)

    res.status(StatusCodes.CREATED).json({
        user: tokenUser,
    })
}

const login = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        throw new customError.BadRequestError('email and password is required');
    }

    const user = await User.findOne({email})
    if (!user) throw new customError.UnauthenticatedError('there is no user with this email');

    const correctPassword = await user.comparePassword(password)
    if (!correctPassword) throw new customError.UnauthenticatedError('password is wrong');

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse(res, tokenUser)

    res.status(StatusCodes.OK).json({
        user: tokenUser,
    })
}

const logout = (req, res) => {
    res.cookie('token', 'token', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg: 'logout'})
}

module.exports = {register, login, logout}
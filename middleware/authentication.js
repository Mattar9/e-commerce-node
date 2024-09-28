const CustomError = require('../errors');
const {tokenIsValid} = require('../utils/jwt')

const authenticatedUser = (req, res, next) => {
    const token = req.signedCookies.token

    if (!token) {
        throw new CustomError.UnauthenticatedError('authentication is invalid')
    }

    try {
        const {userId,name,role} = tokenIsValid({token});
        req.user = {userId,name,role};
        next()
    }catch (err){
        throw new CustomError.UnauthenticatedError('authentication is invalid')
    }
}

const authorizePermission = (...roles) => {
    return (req,res,next) =>{
        if (!roles.includes(req.user.role)) {
            throw new CustomError.ForbiddenAccess('unauthorized to access this route');
        }
        next()
    }
}

module.exports = {authenticatedUser, authorizePermission};
const jwt = require('jsonwebtoken');
const req = require("express/lib/request");

const createJWT = ({payload}) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME});
    return token
}

const tokenIsValid = ({token}) => jwt.verify(token, process.env.JWT_SECRET)

const attachCookiesToResponse = (res, payload) => {
    const token = createJWT({payload:payload});
    const oneDay = 1000 * 60 * 60 * 1000;
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure:process.env.NODE_ENV === 'production',
        signed:true
    });
}

module.exports = {
    createJWT,
    tokenIsValid,
    attachCookiesToResponse
}

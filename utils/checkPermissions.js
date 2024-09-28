const customErrors = require('../errors');

const checkPermissions = (requestedUser,resourceUserId) => {
    if (requestedUser.role === 'admin') return;
    if (requestedUser.userId === resourceUserId.toString()) return;

    throw new customErrors.UnauthenticatedError('Not authorized to access this route')
}

module.exports = checkPermissions;
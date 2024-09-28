const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide a name'],
        minlength: 3,
        maxlength: 25
    },
    email: {
        type: String,
        required: [true, 'please provide an email'],
        unique: [true, 'your email must be unique'],
        validate: {
            validator: validator.isEmail,
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', UserSchema)
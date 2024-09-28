const mongoose = require('mongoose');
const Review = require('./ReviewModel')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide a name'],
        trim: true,
        maxlength: [100, 'name cannot be more than 100 characters'],
    },
    price: {
        type: Number,
        required: [true, 'please provide a price'],
        default: 0,
    },
    description: {
        type: String,
        required: [true, 'please provide a description'],
        maxlength: [1000, 'description cannot be more than 1000 characters'],
    },
    image: {
        type: String,
        default: './uploads/example.jpeg'
    },
    category: {
        type: String,
        required: [true, 'please provide a category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'please provide a company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not supported'
        }
    },
    colors: {
        type: [String],
        required: [true, 'please provide a color'],
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        required: [true, 'please provide an inventory'],
        default: 15,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews:{
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false
})

ProductSchema.pre('deleteOne', { document: true }, async function(next) {
    await this.model('Review').deleteMany({ product: this._id });
    next()
})

module.exports = mongoose.model('Product', ProductSchema);
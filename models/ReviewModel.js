const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please enter a rating'],
    },
    title: {
        type: String,
        required: [true, 'please provide a title'],
        trim: true,
        maxlength: [100, 'title cannot be more than 100 characters'],
    },
    comment: {
        type: String,
        required: [true, 'please provide a comment'],
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
    }
}, {timestamps: true});
ReviewSchema.index({product: 1, user: 1}, {unique: true});

ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        {$match: {product: productId}},
        {
            $group: {
                _id: null,
                averageRating: {$avg: '$rating'},
                numOfReviews: {$sum: 1}
            }
        }
    ]);
    try {
        await this.model('Product').findOneAndUpdate({_id: productId}, {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.numOfReviews || 0
        })
    } catch (e) {
        console.log(e)
    }
    console.log(result)
}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('deleteOne', {document: true}, async function () {
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
const express = require('express');
const connectDB = require('./db/connect')
require('dotenv').config();
const notFoundMiddleware = require('./middleware/not-found');
require('express-async-errors')
const errorHandlerMiddleware = require('./middleware/error-handler')
const authRouter = require('./routes/authRoute')
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');
const uploadFiles = require('express-fileupload')
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean')
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const app = express()

app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60
}))

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))
app.use(uploadFiles())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter);

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        console.log('MongoDB Connected');
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        });
    } catch (err) {
        console.log(err)
    }
}
start()

const mongoose = require('mongoose')
const config = require('../utils/config.js')


const connectToMongo = async () => {

    try {
        const connect = await mongoose.connect(config.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        })

        console.log(`Connected to MongoDB`.rainbow)
    }
    catch (e) {
        console.error(`Error: ${e.message}`.red.bold)
        process.exit(1)
    }
}

module.exports = {
    connectToMongo
}
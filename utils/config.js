require('dotenv').config()

const PORT = process.env.PORT || 3333
let MONGO_URI = process.env.MONGO_URI
const SECRET = process.env.SECRET

if (process.env.NODE_ENV === 'test') {
    MONGO_URI = process.env.MONGO_URI_TEST
}


module.exports = {
    PORT,
    MONGO_URI,
    SECRET
}
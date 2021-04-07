const jwt = require('jsonwebtoken')
const config = require ('../utils/config.js')

const generateToken = (id) => {
    return jwt.sign({id}, config.SECRET)
}

module.exports = { generateToken }
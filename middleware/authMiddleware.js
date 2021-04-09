const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config =  require('../utils/config')

const getTokenFromRequest = async(req, res, next) => {


        let token

        if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith('bearer ')) {
            try {
                const token = req.headers.authorization.substring(7)
                const decodedToken = jwt.verify(token, config.SECRET)
                req.user = await User.findById(decodedToken.id).select('-password')
                next()
            }
            catch (e) {
                // console.error(e.message)
                res.status(401).json({errors: [{msg: 'Invalid token'}]})
            }
        } else {
            // console.error('No token in headers'.red)
            res.status(401).json({ errors: [{msg: 'No token in headers'}] })
        }

}


const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        res.status(401).json({ msg: 'У вас нет прав администратора для этого действия' })
        throw new Error('У вас нет прав администратора для этого действия')
    }
}

module.exports = {
    getTokenFromRequest,
    isAdmin
}
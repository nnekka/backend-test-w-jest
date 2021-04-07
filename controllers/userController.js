const User = require('../models/User')
const errorUtil = require('../utils/errorHandler')
const bcrypt = require('bcryptjs')
const tokenUtil = require('../utils/generateToken')



const getUsers = async (req, res) => {
    const users = await User.find({})
    res.status(200).json(users)
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await User.findOne({ email })
        const passwordCorrect = user
            ? await bcrypt.compare(password, user.password)
            : false
        if (!(user&&passwordCorrect)){
            return res.status(401).json({ errors: [{ msg: 'Wrong credentials'}] })
        }
        const token = tokenUtil.generateToken(user._id)
        res.json(`Bearer ${token}`)
    }
    catch (e) {
        errorUtil.errorHandler(res, e)
    }
}

module.exports = {
    getUsers,
    loginUser
}
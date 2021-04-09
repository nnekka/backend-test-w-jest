const User = require('../models/User')
const errorUtil = require('../utils/errorHandler')
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator')
const tokenUtil = require('../utils/generateToken')



const getUsers = async (req, res) => {
    const users = await User.find({})
    res.status(200).json(users)
}

const registerUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const {name, email, password} = req.body

        const existUser = await User.findOne({ email })
        if (existUser){
            return res.status(400).json({ errors: [{ msg: 'Email уже занят'}] })
        }
        const passwordHash = await bcrypt.hashSync(password, await bcrypt.genSalt(10))
        const user = new User({
            name,
            email,
            password: passwordHash
        })
        await user.save()
        const token = tokenUtil.generateToken(user._id)
        res.status(201).json(`Bearer ${token}`)
    }
    catch (e) {
        errorUtil.errorHandler(res, e)
    }
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
        res.status(200).json(`Bearer ${token}`)
    }
    catch (e) {
        errorUtil.errorHandler(res, e)
    }
}

const getUserByToken = async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password')
        if (!user){
            return res.status(404).json({ errors: [{ msg: 'User not found'}] })
        }
        res.status(200).json(user)
    }
    catch (e) {
        errorUtil.errorHandler(res, e)
    }
}


module.exports = {
    getUsers,
    loginUser,
    registerUser,
    getUserByToken
}
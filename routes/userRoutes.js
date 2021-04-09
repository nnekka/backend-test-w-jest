const express = require('express')
const router = express.Router()
const {check} = require('express-validator')
const userController = require('../controllers/userController')
const middleware = require('../middleware/authMiddleware')

router.route('/').get(userController.getUsers)
router.route('/login').post(userController.loginUser)
router.route('/user').get(middleware.getTokenFromRequest, userController.getUserByToken)
router.route('/').post([
        check('password', 'Пароль должен быть как минимум 3 символа').isLength(3),
        check('email', 'Введите пожалуйста email').isEmail()
    ],
    userController.registerUser)

module.exports = router
const Calendar = require('../models/Calendar')
const User = require('../models/User')
const errorUtil = require('../utils/errorHandler')
const {validationResult} = require('express-validator')

// GET /api/calendars
// Получить все календари юзера

const getCalendarsOfUser = async (req, res) => {
    const calendars = await Calendar.find({user: req.user.id})
    res.status(200).json(calendars)
}

// GET /api/calendars/:id
// Получить календарь по id

const getCalendarById = async (req, res) => {

    try {
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)){
            const calendar = await Calendar.findById(req.params.id).populate('days')
            if (!calendar ) {
                return res.status(404).json({errors: [{msg: 'Calendar not found'}]})
            }
            res.status(200).json(calendar)
        } else {
            return res.status(400).json({ errors: [{msg: 'Id is not valid'}] })
        }
    }
    catch (e) {
        errorUtil.errorHandler(res, e)
    }
}

// POST /api/calendars
// Создать календарь

const createCalendar = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const user = await User.findById(req.user.id)
        const existCalendar = await Calendar.findOne({
            title: req.body.title,
            user: req.user.id,
            year: req.body.year

        })
        if (existCalendar) {
            return res.status(400).json({errors: [{msg: 'Календарь с таким название уже существует'}]})
        }

        const calendar = new Calendar({
            title: req.body.title,
            year: req.body.year,
            description: req.body.description,
            legendType: req.body.legendType,
            user: user.id
        })

        await calendar.save()
        res.status(200).json(calendar)
    }
    catch (e) {
        errorUtil.errorHandler(res, e)
    }
}

module.exports = {
    getCalendarById,
    getCalendarsOfUser,
    createCalendar
}
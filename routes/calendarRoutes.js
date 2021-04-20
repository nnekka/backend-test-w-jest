const express = require('express')
const router = express.Router()
const {check} = require('express-validator')
const calendarController = require('../controllers/calendarController')
const middleware = require('../middleware/authMiddleware')



router.route('/').get( middleware.getTokenFromRequest, calendarController.getCalendarsOfUser)
router.route('/:id').get( middleware.getTokenFromRequest, calendarController.getCalendarById)
router.route('/').post( [
    check('title', 'Title is required').not().isEmpty(),
    check('year', 'Year is required').not().isEmpty(),
    check('legendType', 'Legend type is required').not().isEmpty()
], middleware.getTokenFromRequest, calendarController.createCalendar)
// router.route('/:id/legend').put(passport.authenticate('jwt', { session: false }), addLegend)
// router.route('/:id/day').put(passport.authenticate('jwt', { session: false }), addDay)
// router.route('/:id').delete(passport.authenticate('jwt', { session: false }), deleteCalendar)
// router.route('/:id/legend/:legend_id').delete(passport.authenticate('jwt', { session: false }), deleteLegend)
// router.route('/:id/day/:day_id').delete(passport.authenticate('jwt', { session: false }), deleteDay)

module.exports = router
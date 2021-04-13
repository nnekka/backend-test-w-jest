const mongoose = require('mongoose')

const calendarSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: { type: String, required: true },
    days: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Day'
        }
    ],
    legends: [
        {
            color: { type: String, default: 'No color' },
            text: String,
            imageSrc: { type: String, default: 'No image' }
        }
    ],
    description: String,
    year: { type: Number, required: true},
    legendType: { type: String, required: true }
})

const Calendar = mongoose.model('Calendar', calendarSchema)

module.exports = Calendar
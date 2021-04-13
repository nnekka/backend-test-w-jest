const mongoose = require('mongoose')

const daySchema = new mongoose.Schema({

    day: { type: Number, required: true },
    month: { type: Number, required: true },
    calendar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calendar'
    },
    legend: {
        color: { type: String, default: '' },
        text: String,
        imageSrc: { type: String, default: '' }
    }

})

const Day = mongoose.model('Day', daySchema)

module.exports = Day
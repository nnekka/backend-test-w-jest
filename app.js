const express = require('express')
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
const calendarRoutes = require('./routes/calendarRoutes')
const connectDB = require('./utils/connect')
const colors = require('colors')
const app = express()

connectDB.connectToMongo()

app.use(express.json())
app.use(cors())
app.use('/api/users', userRoutes)
app.use('/api/calendars', calendarRoutes)

module.exports = app
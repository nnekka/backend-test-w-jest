const express = require('express')
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
const connectDB = require('./utils/connect')
const colors = require('colors')
const app = express()

connectDB.connectToMongo()

app.use('/api/users', userRoutes)

module.exports = app
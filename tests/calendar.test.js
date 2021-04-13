const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Calendar = require('../models/Calendar')
const Day = require('../models/Day')

describe('Calendar tests', ()=> {

    beforeEach(async() => {
        await User.deleteMany({})
        await Calendar.deleteMany({})
        await Day.deleteMany({})


        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({name: 'Test', email: 'test@example.com', password: passwordHash})
        const savedUser = await user.save()

        const calendar = new Calendar({
            title: 'Test Calendar',
            description: 'Test description',
            year: 2021,
            legendType: 'с картинками',
            user: savedUser.id
        })
        await calendar.save()

        // const day = new Day({
        //     day: 1,
        //     month: 1,
        //     legend: ,
        //     calendar: calendar._id
        // })
        // await day.save()
    })

    it.only('getting of all calendars of logged user succeeds with status 200', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const response = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)


        const responseAfterLogin = await api
            .get('/api/calendars')
            .set({Authorization: response.body})
            .expect(200)

        expect(responseAfterLogin.body.length).toBe(1)
        expect(responseAfterLogin.body[0]).toMatchObject({'title':'Test Calendar', 'description': 'Test description'})

    })

})


afterAll(() => {
    mongoose.connection.close()
})
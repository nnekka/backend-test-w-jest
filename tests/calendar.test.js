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

        const calendar2 = new Calendar({
            title: 'Test Calendar2',
            description: 'Test description2',
            year: 2021,
            legendType: 'с картинками',
            user: savedUser.id
        })
        await calendar2.save()

        // const day = new Day({
        //     day: 1,
        //     month: 1,
        //     legend: ,
        //     calendar: calendar._id
        // })
        // await day.save()
    })

    it('getting of all calendars of logged user succeeds with status 200', async () => {

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

        expect(responseAfterLogin.body.length).toBe(2)
        expect(responseAfterLogin.body[0]).toMatchObject({'title':'Test Calendar', 'description': 'Test description'})

    })
    it('getting of all calendars of logged user fails if there is no valid token', async () => {


        const responseAfterLogin = await api
            .get('/api/calendars')
            .set({Authorization: 'Bearer 11111'})
            .expect(401)

    })

    it('getting of calendar by id succeeds with status 200', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const responseLogin = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const responseAllCalendars = await api
            .get('/api/calendars')
            .set({Authorization: responseLogin.body})
            .expect(200)

        const responseCalendarById = await api
            .get(`/api/calendars/${responseAllCalendars.body[0]._id}`)
            .set({Authorization: responseLogin.body})
            .expect(200)

        expect(responseCalendarById.body).toMatchObject({
            'title':'Test Calendar',
            'description': 'Test description'
        })

    })

    it('getting of calendar by id fails if id is not valid', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const responseLogin = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const responseAllCalendars = await api
            .get('/api/calendars')
            .set({Authorization: responseLogin.body})
            .expect(200)

        const responseCalendarById = await api
            .get(`/api/calendars/4555`)
            .set({Authorization: responseLogin.body})
            .expect(400)

        expect(responseCalendarById.body.errors[0].msg).toContain('Id is not valid')

    })

    it('getting of calendar by id fails if there is no token in headers', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const responseLogin = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)



        const responseAllCalendars = await api
            .get('/api/calendars')
            .set({Authorization: responseLogin.body})
            .expect(200)

        const responseCalendarById = await api
            .get(`/api/calendars/${responseAllCalendars.body[0]._id}`)
            .expect(401)

        expect(responseCalendarById.body.errors[0].msg).toContain('No token in headers')

    })

    it('getting of calendar by id fails if there is invalid token in headers', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const responseLogin = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const responseAllCalendars = await api
            .get('/api/calendars')
            .set({Authorization: responseLogin.body})
            .expect(200)

        const responseCalendarById = await api
            .get(`/api/calendars/${responseAllCalendars.body[0]._id}`)
            .set({Authorization: 'Bearer 111'})
            .expect(401)

        expect(responseCalendarById.body.errors[0].msg).toContain('Invalid token')

    })

    it('creation of new calendar succeeds when token is valid', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const calendarsBefore = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtStart = calendarsBefore.body

        const calendar = {
            title: 'New calendar',
            year: 2021,
            description: 'New calendar description',
            legendType: 'цветная',
        }

        const creation = await api
            .post('/api/calendars')
            .set({Authorization: auth.body})
            .send(calendar)
            .expect(200)

        const calendarsAfter = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtEnd = calendarsAfter.body

        expect(calendarsAtEnd).toHaveLength(calendarsAtStart.length + 1)
        expect(creation.body).toMatchObject({
            'title':'New calendar',
            'description': 'New calendar description'
        })
    })

    it('creation of new calendar fails when token is invalid', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const calendarsBefore = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtStart = calendarsBefore.body

        const calendar = {
            title: 'New calendar',
            year: 2021,
            description: 'New calendar description',
            legendType: 'цветная',
        }

        const creation = await api
            .post('/api/calendars')
            .set({Authorization: 'Bearer 1111'})
            .send(calendar)
            .expect(401)

        const calendarsAfter = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtEnd = calendarsAfter.body

        expect(calendarsAtEnd).toHaveLength(calendarsAtStart.length)
        expect(creation.body.errors[0].msg).toContain('Invalid token')

    })

    it('creation of new calendar fails when there is no token in headers', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const calendarsBefore = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtStart = calendarsBefore.body

        const calendar = {
            title: 'New calendar',
            year: 2021,
            description: 'New calendar description',
            legendType: 'цветная',
        }

        const creation = await api
            .post('/api/calendars')
            .send(calendar)
            .expect(401)

        const calendarsAfter = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtEnd = calendarsAfter.body

        expect(calendarsAtEnd).toHaveLength(calendarsAtStart.length)
        expect(creation.body.errors[0].msg).toContain('No token in headers')

    })


    it('creation of new calendar fails when data is not valid', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const calendarsBefore = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtStart = calendarsBefore.body

        const calendar = {
            description: 'New calendar description',
        }

        const creation = await api
            .post('/api/calendars')
            .set({Authorization: auth.body})
            .send(calendar)
            .expect(400)

        const calendarsAfter = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        const calendarsAtEnd = calendarsAfter.body
        const errorsMsg = creation.body.errors.map(err => err.msg)

        expect(calendarsAtEnd).toHaveLength(calendarsAtStart.length)
        expect(errorsMsg).toContain('Title is required')
        expect(errorsMsg).toContain('Year is required')
        expect(errorsMsg).toContain('Legend type is required')
    })

    it('adding legend succeeds when token is valid and data is color', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const legend = {
            color: 'red',
            text: 'red'
        }

        const calendarsOfLoggedUser = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)

        console.log((calendarsOfLoggedUser.body[0]))

        const addingLegend = await api
            .put(`/api/calendars/${calendarsOfLoggedUser.body[0]._id}/legend`)
            .set({Authorization: auth.body})
            .send(legend)
            .expect(200)


        expect(addingLegend.body.legends[0]).toMatchObject({
            'color': 'red',
            'text': 'red',
            'imageSrc': 'No image'
        })
    })

    it('adding legend succeeds when token is valid and data is image', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const legend = {
            imageSrc: '/uploads/pic.jpg',
            text: 'pic'
        }

        const calendarsOfLoggedUser = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)


        const addingLegend = await api
            .put(`/api/calendars/${calendarsOfLoggedUser.body[0]._id}/legend`)
            .set({Authorization: auth.body})
            .send(legend)
            .expect(200)

        expect(addingLegend.body.legends[0]).toMatchObject({
            'color': 'No color',
            'text': 'pic',
            'imageSrc': '/uploads/pic.jpg'
        })
    })

    it('adding legend fails when there is no data in request', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const auth = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const legend = {}

        const calendarsOfLoggedUser = await api
            .get('/api/calendars')
            .set({Authorization: auth.body})
            .expect(200)


        const addingLegend = await api
            .put(`/api/calendars/${calendarsOfLoggedUser.body[0]._id}/legend`)
            .set({Authorization: auth.body})
            .send(legend)
            .expect(400)

        expect(addingLegend.body.errors[0].msg).toContain('Выберите цвет или картинку')
    })

})


afterAll(() => {
    mongoose.connection.close()
})
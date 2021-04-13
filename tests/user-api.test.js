const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')
const helper = require('./test_helper')
const User = require('../models/User')
const Calendar = require('../models/Calendar')
const Day = require('../models/Day')

describe('Simple tests of users', ()=> {

    beforeEach(async() => {
        await User.deleteMany({})

        for (let user of helper.initialUsers) {
            let userObject = new User(user)
            await userObject.save()
        }
    })

    test('users are returned as json', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('we got all users from database', async () => {
        const response = await api.get('/api/users')

        expect(response.body).toHaveLength(helper.initialUsers.length)
    })

    test('a specific user with "name: Kate" is within the returned users', async () => {
        const response = await api.get('/api/users')

        const contents = response.body.map(p => p.name)
        expect(contents).toContain('Kate')

    })
})

describe('when there is initially one user in db', ()=> {

    beforeEach(async() => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({name: 'Test', email: 'test@example.com', password: passwordHash})
        await user.save()
    })
    test('login return a bearer token', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }

        const response = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        expect(response.body).toContain('Bearer')

    })

    test('when email is wrong there must be error', async () => {

        const user = {
            email: 'tes@example.com',
            password: 'secret'
        }

        const response = await api
            .post('/api/users/login')
            .send(user)
            .expect(401)

        expect(response.body.errors[0].msg).toContain('Wrong credentials')

    })

    test('when password is wrong there must be error', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secre'
        }

        const response = await api
            .post('/api/users/login')
            .send(user)
            .expect(401)

        expect(response.body.errors[0].msg).toContain('Wrong credentials')

    })
//---------------------------------------register new User begin--------------------------------------------

    test('creation succeeds with a fresh username', async () => {

        const user = {
            name: 'Test2',
            email: 'test2@example.com',
            password: 'secret'
        }

        const usersAtBegin = await helper.usersInDb()
        const response = await api
            .post('/api/users')
            .send(user)
            .expect(201)
        const usersAtEnd = await helper.usersInDb()
        const userEmails = usersAtEnd.map(u => u.email)

        expect(usersAtEnd).toHaveLength(usersAtBegin.length + 1)
        expect(userEmails).toContain('test2@example.com')
    })

    test('creation fails with password shorter than 3 symbols', async () => {

        const user = {
            name: 'Test2',
            email: 'test2@example.com',
            password: 'se'
        }

        const usersAtBegin = await helper.usersInDb()
        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtBegin.length)

    })

    test('creation fails with email is not being email', async () => {

        const user = {
            name: 'Test2',
            email: 'test2',
            password: 'secret'
        }

        const usersAtBegin = await helper.usersInDb()
        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtBegin.length)

    })

    test('creation fails if user already exists', async () => {

        const user = {
            name: 'Test',
            email: 'test@example.com',
            password: 'secret'
        }

        const usersAtBegin = await helper.usersInDb()
        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtBegin.length)
        expect(response.body.errors[0].msg).toContain('Email уже занят')

    })

    test('creation fails if there s no data', async () => {

        const user = {

        }

        const usersAtBegin = await helper.usersInDb()
        const response = await api
            .post('/api/users')
            .send(user)
            .expect(400)
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtBegin.length)
    })
//---------------------------------------register new User end--------------------------------------------
//---------------------------------------get User By Token begin------------------------------------------

    test('getting of logged user succeeds with status 200', async () => {

        const user = {
            email: 'test@example.com',
            password: 'secret'
        }


        const response = await api
            .post('/api/users/login')
            .send(user)
            .expect(200)

        const responseAfterLogin = await api
            .get('/api/users/user')
            .set({Authorization: response.body})
            .expect(200)

        expect(responseAfterLogin.body).toMatchObject({'email':'test@example.com', 'name': 'Test'})
    })

    test('getting of logged user fails when there s no token in headers', async () => {


        const response = await api
            .get('/api/users/user')
            .expect(401)


        expect(response.body.errors[0].msg).toContain('No token in headers')
    })

    test('getting of logged user fails when there s non valid token in headers', async () => {


        const responseAfterLogin = await api
            .get('/api/users/user')
            .set({Authorization: 'Bearer 1111111'})
            .expect(401)

        expect(responseAfterLogin.body.errors[0].msg).toContain('Invalid token')
    })
//---------------------------------------get User By Token end------------------------------------------
})


afterAll(() => {
    mongoose.connection.close()
})
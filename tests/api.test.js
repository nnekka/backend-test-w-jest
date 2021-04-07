const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')
const helper = require('./test_helper')
const User = require('../models/User')

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
})

afterAll(() => {
    mongoose.connection.close()
})
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')
const helper = require('./test_helper')
const User = require('../models/User')

beforeEach(async() => {
    await User.deleteMany({})

    for (let user of helper.initialUsers) {
        let userObject = new User(user)
        await userObject.save()
    }
})

describe('Testing users', ()=> {
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

afterAll(() => {
    mongoose.connection.close()
})
const User = require('../models/user')

const initialUsers = [
    {
        name: 'Lena',
        email: 'lena@example.com',
        password: '123456'
    },
    {
        name: 'Kate',
        email: 'kate@example.com',
        password: '123456'
    }
]

const usersInDb = async() => {
    const users = await User.find({})
    return users.map(p => p.toJSON())
}


module.exports = {
    initialUsers, usersInDb
}
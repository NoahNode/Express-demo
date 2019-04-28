const config = require('config')
const Joi = require('joi')
const morgan = require('morgan')
const helmet = require('helmet')
const logger = require('./logger')
const authenticator = require('./authenticator')
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(logger)
app.use(authenticator)
app.use(helmet())


if(app.get('env') === 'development'){
    app.use(morgan('tiny'))
    console.log('Morgan enabled...')
}

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
]

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.get('/api/courses', (req, res) => {
    res.send(courses)
})

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(course => course.id === parseInt(req.params.id))
    course ? res.send(course) : res.status(404).send('Course with the given id was not found')
})

app.post('/api/courses', (req, res) => {
    const {error} = validateCourse(req.body) // result.error
    if (error) return res.status(400).send(error.details[0].message)

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }

    courses.push(course)
    res.send(course)
})

app.put('/api/courses/:id', (req, res) => {
    //Lookup the course
    const course = courses.find(course => course.id === parseInt(req.params.id))
    if(!course) return res.status(404).send('Course with the given id was not found')

    const {error} = validateCourse(req.body) // result.error
    if (error) return res.status(400).send(error.details[0].message)

    course.name = req.body.name
    res.send(course)
})

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(course => course.id === parseInt(req.params.id))
    if(!course) return res.status(404).send('Course with the given id was not found')

    const index = courses.indexOf(course)
    courses.splice(index, 1)

    res.send(course)
})


validateCourse = (course) => {
    const schema = {
        name: Joi.string().min(3).required()
    }
    return Joi.validate(course, schema)
}

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`))
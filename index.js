const express = require('express')

const app = express()

const cors = require('cors')

require('dotenv').config()

const morgan = require('morgan')

// eslint-disable-next-line no-unused-vars
const isContains = require('./utl')

const Person = require('./models/person')

const port = process.env.PORT || 3000

app.use(cors())

app.use(express.static('build'))

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(morgan(':body :method :url :response-time'))

// GET all people
app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

// search by id
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then((person) => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
    .catch((error) => next(error))
})

app.get('/api/info', (req, res) => {
  Person.find({}).then((persons) => {
    res.send(`
      <p>Phonebook contains information about ${persons.length} people</p>
      <p>${new Date()}</p>
    `)
  })
})

// eslint-disable-next-line consistent-return
app.post('/api/persons/', (request, response, next) => {
  const { body } = request
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing',
    })
  }
  // check for matches in the database
  Person.find({}).then(() => {
    // custom uniqueness validator
    // if (isContains(persons, 'name', body.name)) {
    //   return response.status(400).json({ error: 'name must be unique' })
    // }
    // if (isContains(persons, 'number', body.number)) {
    //   return response.status(400).json({ error: 'number must be unique' })
    // }

    // If unique, then create a new record in the DB
    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person.save().then((savedPerson) => {
      response.json(savedPerson)
    })
      .catch((error) => next(error))
  })
})

// PUT
app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req

  const person = {
    name: body.name,
    number: body.number,
  }

  // new: true - indicates that db will return an updated object
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// eslint-disable-next-line consistent-return
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.listen(port, () => console.log(`server on: ${port}`))

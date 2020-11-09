const express = require('express')
const app = express();

const cors = require('cors')

require('dotenv').config()

const morgan = require('morgan');

const isContains = require('./utl');

const Person = require('./models/person')
const port = process.env.PORT || 3000

app.use(cors())

app.use(express.json())

morgan.token('body', function getId (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':body :method :url :response-time'))

// GET all people
app.get('/api/person', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

// search by id
app.get('/api/people/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => {
    console.log(error)
    res.status(500).end()
  })
})

app.get('/api/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`
      <p>Phonebook contains information about ${persons.length} people</p>
      <p>${new Date()}</p>
    `)
  })
})

const generateId = (arr) => {
  const maxId = arr.length > 0
    ? Math.max(...arr.map(a => a.id))
    : 0
  return maxId + 1
}

app.post('/api/person/', (request, response) => {
  const body  = request.body;
  if (!body.name ||!body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  Person.find({}).then(persons => {
    if (isContains(persons, 'name', body.name)) {
      return response.status(400).json({ error: 'name must be unique' })
    }
    if (isContains(persons, 'number', body.number)) {
      return response.status(400).json({ error: 'number must be unique' })
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })
})

app.delete('/api/people/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.listen(port, () => console.log(`server on: ${port}`))


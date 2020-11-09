const express = require('express')
const app = express();

const cors = require('cors')

const morgan = require('morgan');

const isContains = require('./utl');

require('dotenv').config()
const port = process.env.PORT || 3000

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

// Промежуточное ПО - это функция, которая получает три параметра:
// custom midleware
// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }
app.use(cors())

app.use(express.json())

// morgan
// app.use(morgan('tiny'))

morgan.token('body', function getId (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':body :method :url :response-time'))

// app.use(requestLogger)

app.get('/api/person', (req, res) => {
  res.json(persons)
})

app.get('/api/people/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.get('/api/info', (req, res) => {
  res.send(`
    <p>Phonebook has info ${persons.length - 1}</p>
    <p>${new Date()}</p>
  `)
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

if (isContains(persons, 'name', body.name)) {
  return response.status(400).json({ error: 'name must be unique' })
}
if (isContains(persons, 'number', body.number)) {
  return response.status(400).json({ error: 'number must be unique' })
}


  const person = {
    name: body.name,
    number: body.number,
    id: generateId(persons),
  }

  persons = persons.concat(person)
  response.json(person)
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


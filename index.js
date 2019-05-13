/* eslint-disable no-undef */
// setup
require('dotenv').config()
import express, { staticExpress } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import morgan, { token } from 'morgan';

token('body', function getBody (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

const app = express()
import Person, { find, findById, findByIdAndUpdate, findByIdAndRemove } from './models/person';

app.use(staticExpress('build'))
app.use(cors())
app.use(json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// GET
app.get('/api/persons', (request, response) => {
  find({})
    .then(persons => {
      response.json(persons.map(person => person.toJSON()))
    })
})

// GET
app.get('/api/persons/:id', (request, response, next) => {
  findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// GET
app.get('/info', (request, response) => {
  find({}).then(persons => {
    const numberOfPersons = persons.length
    const currentDate = new Date().toString()
    let info = `Puhelinluettelossa on ${numberOfPersons} henkilon tiedot`
    response.write(info)
    response.write('\n')
    response.write(currentDate)
    response.end()
  })
})

// POST
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormatedPerson => {
      response.json(savedAndFormatedPerson)
    })
    .catch(error => next(error))
})

// PUT
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  findByIdAndUpdate(request.params.id, person, { new: true })
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormatedPerson => {
      response.json(savedAndFormatedPerson)
    })
    .catch(error => next(error))
})

// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// olemattomien osoitteiden käsittely
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// virheellisten pyyntöjen käsittely
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

// portti
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
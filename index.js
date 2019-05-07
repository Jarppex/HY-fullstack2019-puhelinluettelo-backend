const express = require('express')
const bodyParser = require('body-parser') 
const app = express()

let notes = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "045-1236543",
    },
    {
      "id": 2,
      "name": "Arto Järvinen",
      "number": "041-21423123"
    },
    {
      "id": 3,
      "name": "Lea Kutvonen",
      "number": "040-4323234"
    },
    {
      "id": 4,
      "name": "Martti Tienari",
      "number": "09-784232"
    }
]

app.use(bodyParser.json())

const generateId = () => {
    return Math.floor(Math.random() * Math.floor(1000))
  }

app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ error: 'content missing' })
    }

    const sameName = notes.find(note => note.name === body.name)
    if (sameName) {
      return response.status(403).json({ error: 'name must be unique' })
    }
  
    const note = {
      id: generateId(),
      name: body.name,
      number: body.number
    }
  
    notes = notes.concat(note)
  
    response.json(note)
  })

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)

    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })

app.get('/api/persons', (request, response) => {
    response.json(notes)
  })

app.get('/info', (request, response) => {
    const numberOfNotes = notes.length
    const currentDate = new Date().toString()
    let info = `Puhelinluettelossa on ${numberOfNotes} henkilon tiedot`
    response.write(info)
    response.write('\n')
    response.write(currentDate)
    response.end()
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
  
    response.status(204).end()
  })

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
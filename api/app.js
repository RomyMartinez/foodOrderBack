import fs from 'node:fs/promises'

import bodyParser from 'body-parser'
import express from 'express'

const app = express()

const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(express.static('public'))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Middleware para lidar com requisições OPTIONS (preflight)
app.options('*', (req, res) => {
  res.sendStatus(200)
})

// Configuração dos middlewares
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  return res.json({ message: 'Hello World' })
})

app.get('/meals', async (req, res) => {
  try {
    const meals = await fs.readFile('../available-meals.json', 'utf8') // Ajuste o caminho se necessário
    res.json(JSON.parse(meals))
  } catch (error) {
    console.error('Error reading meals data:', error) // Adiciona log para depuração
    res.status(500).json({ message: 'Error reading meals data' })
  }
})

app.post('/orders', async (req, res) => {
  const orderData = req.body.order

  if (
    orderData === null ||
    orderData.items === null ||
    orderData.length === 0
  ) {
    return res.status(400).json({ message: 'Missing data.' })
  }

  if (
    orderData.customer.email === null ||
    !orderData.customer.email.includes('@') ||
    orderData.customer.name === null ||
    orderData.customer.name.trim() === '' ||
    orderData.customer.street === null ||
    orderData.customer.street.trim() === '' ||
    orderData.customer['postal-code'] === null ||
    orderData.customer['postal-code'].trim() === '' ||
    orderData.customer.city === null ||
    orderData.customer.city.trim() === ''
  ) {
    return res.status(400).json({
      message:
        'Email, name, street, postal code or city is missing or are incorrect.',
    })
  }

  const newOrder = {
    ...orderData,
    id: (Math.random() * 1000).toString(),
  }
  const orders = await fs.readFile('./data/orders.json', 'utf8')
  const allOrders = JSON.parse(orders)
  allOrders.push(newOrder)
  await fs.writeFile('./data/orders.json', JSON.stringify(allOrders))
  res.status(201).json({ message: 'Order created!' })
})

app.use((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  res.status(404).json({ message: 'Not found' })
})

app.listen(port)

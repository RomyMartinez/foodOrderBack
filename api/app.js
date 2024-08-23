import express from 'express'
import bodyParser from 'body-parser'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDC1hVhdCDEg10SLCG932baOB5A4xOuI1c',
  authDomain: 'foodorder-dcd95.firebaseapp.com',
  projectId: 'foodorder-dcd95',
  storageBucket: 'foodorder-dcd95.appspot.com',
  messagingSenderId: '434585938689',
  appId: '1:434585938689:web:109e773b64a3405b3e8900',
  measurementId: 'G-EGYXBKVF1Q',
}

// Inicializar o Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const server = express()
const port = process.env.PORT || 3000

server.use(bodyParser.json())
server.use(express.static('public'))

// Middleware para CORS
server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Middleware para lidar com requisições OPTIONS (preflight)
server.options('*', (req, res) => {
  res.sendStatus(200)
})

server.get('/', (req, res) => {
  return res.json({ message: 'Hello World' })
})

server.get('/meals', async (req, res) => {
  try {
    const mealsCollection = collection(db, 'meals')
    const mealsSnapshot = await getDocs(mealsCollection)
    const mealsList = mealsSnapshot.docs.map((doc) => doc.data())
    res.json(mealsList)
  } catch (error) {
    console.error('Error reading meals data:', error)
    res.status(500).json({ message: 'Error reading meals data' })
  }
})

server.post('/orders', async (req, res) => {
  const orderData = req.body.order

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ message: 'Missing data.' })
  }

  if (
    !orderData.customer.email ||
    !orderData.customer.email.includes('@') ||
    !orderData.customer.name ||
    !orderData.customer.name.trim() ||
    !orderData.customer.street ||
    !orderData.customer.street.trim() ||
    !orderData.customer['postal-code'] ||
    !orderData.customer['postal-code'].trim() ||
    !orderData.customer.city ||
    !orderData.customer.city.trim()
  ) {
    return res.status(400).json({
      message:
        'Email, name, street, postal code or city is missing or incorrect.',
    })
  }

  try {
    const ordersCollection = collection(db, 'orders')
    const newOrder = {
      ...orderData,
      id: (Math.random() * 1000).toString(),
    }
    await addDoc(ordersCollection, newOrder)
    res.status(201).json({ message: 'Order created!' })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ message: 'Error creating order' })
  }
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

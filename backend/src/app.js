import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import {
  fetchTodoLists,
  fetchTodoListById,
  createTodoItem,
  fetchTodoItemById,
  updateTodoItem,
  deleteTodoItem
} from './todo-service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => res.send('Pong!'))

app.get('/api/todo-lists', async (req, res) => {
  try {
    const todoLists = await fetchTodoLists()
    res.json(todoLists)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/todo-list/:listId', async (req, res) => {
  try {
    const todoList = await fetchTodoListById(req.params.listId)
    if (!todoList) return res.status(404).json({ message: 'Todo list not found' })
    res.json(todoList)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/todo-list/:listId/item', async (req, res) => {
  try {
    const todoItem = await createTodoItem(req.params.listId, req.body)
    res.json(todoItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/todo-list/:listId/item/:itemId', async (req, res) => {
  try {
    const todoItem = await fetchTodoItemById(req.params.listId, req.params.itemId)
    if (!todoItem) return res.status(404).json({ message: `Todo item not found` })
    res.json(todoItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.patch('/api/todo-list/:listId/item/:itemId', async (req, res) => {
  try {
    const updatedTodoItem = await updateTodoItem(req.params.listId, req.params.itemId, req.body)
    res.json(updatedTodoItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/todo-list/:listId/item/:itemId', async (req, res) => {
  try {
    const deletedTodoItem = await deleteTodoItem(req.params.listId, req.params.itemId)
    res.json(deletedTodoItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Serve static files from the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'))
})
app.use(express.static(path.join(__dirname, '../../frontend/build')))

export default app

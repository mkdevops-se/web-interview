import express from 'express'
import cors from 'cors'
import {
  fetchTodoLists,
  fetchTodoListById,
  createTodoItem,
  fetchTodoItemById,
  updateTodoItem,
  deleteTodoItem, createTodoList
} from './todo-service.js'

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

app.post('/api/todo-list', async (req, res) => {
  try {
    const todoList = await createTodoList(req.body)
    if (!todoList) return res.status(400).json({ message: 'Todo list could not be created' })
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

export default app

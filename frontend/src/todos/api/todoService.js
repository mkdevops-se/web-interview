import axios from 'axios'

export const fetchTodoByListId = async (todoListId) => {
  try {
    const response = await axios.get(`/api/todo-list/${todoListId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching todo lists:', error)
    throw error
  }
}

export const autosaveTodoItem = async (todoListId, itemId, updatedText) => {
  try {
    await axios.patch(`/api/todo-list/${todoListId}/item/${itemId}`, {
      itemTitle: updatedText,
    })
  } catch (error) {
    console.error('Error autosaving item:', error)
    throw error
  }
}

export const addTodoItem = async (todoListId) => {
  try {
    const response = await axios.post(`/api/todo-list/${todoListId}/item`, { itemTitle: '' })
    return response.data
  } catch (error) {
    console.error('Error adding new todo item:', error)
    throw error
  }
}

export const deleteTodoItem = async (todoListId, itemId) => {
  try {
    await axios.delete(`/api/todo-list/${todoListId}/item/${itemId}`)
  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error)
    throw error
  }
}

export const toggleTodoItem = async (todoListId, itemId, completed) => {
  try {
    await axios.patch(`/api/todo-list/${todoListId}/item/${itemId}`, { completed })
  } catch (error) {
    console.error('Error updating todo item:', error)
    throw error
  }
}

export const reorderTodoItems = async (todoListId, itemIds) => {
  try {
    await axios.patch(`/api/todo-list/${todoListId}/reorder`, { itemIds })
  } catch (error) {
    console.error('Error reordering todo items:', error)
    throw error
  }
}
import axiosInstance from './axiosInstance'
import { handleApiError } from './errorHundler'

export const fetchTodoByListId = async (todoListId) => {
  try {
    const response = await axiosInstance.get(`/todo-list/${todoListId}`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

export const autosaveTodoItem = async (todoListId, itemId, updatedText) => {
  try {
    const response = await axiosInstance.patch(`/todo-list/${todoListId}/item/${itemId}`, {
      itemTitle: updatedText,
    })
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

export const addTodoItem = async (todoListId) => {
  try {
    const response = await axiosInstance.post(`/todo-list/${todoListId}/item`, {
      itemTitle: '',
    })
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

export const deleteTodoItem = async (todoListId, itemId) => {
  try {
    const response = await axiosInstance.delete(`/todo-list/${todoListId}/item/${itemId}`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

export const toggleTodoItem = async (todoListId, itemId, completed) => {
  try {
    const response = await axiosInstance.patch(`/todo-list/${todoListId}/item/${itemId}`, {
      completed,
    })
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

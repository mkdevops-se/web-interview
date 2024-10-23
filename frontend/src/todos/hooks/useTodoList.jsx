import { useReducer, useEffect, useMemo } from 'react'
import debounce from 'lodash/debounce'
import {
  addTodoItem,
  deleteTodoItem,
  toggleTodoItem,
  autosaveTodoItem,
  fetchTodoByListId,
} from '../api/todoService'

const ACTION_TYPES = {
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  ADD_ITEM: 'ADD_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  TOGGLE_COMPLETED: 'TOGGLE_COMPLETED',
  SAVE_ITEM: 'SAVE_ITEM',
  SAVE_ITEM_DONE: 'SAVE_ITEM_DONE',
  SET_LOADING: 'SET_LOADING',
}

const handleError = (dispatch, error) => {
  console.log('2 error', error)
  dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error.message })
}

export const useTodoList = (todoListId) => {
  const initialState = {
    todoList: null,
    isLoading: true,
    error: null,
    isSavingItemId: null,
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case ACTION_TYPES.FETCH_SUCCESS:
        return { ...state, todoList: action.payload, isLoading: false, error: null }
      case ACTION_TYPES.FETCH_ERROR:
        return { ...state, error: action.payload, isLoading: false }
      case ACTION_TYPES.ADD_ITEM:
        return {
          ...state,
          todoList: { ...state.todoList, items: [...state.todoList.items, action.payload] },
        }
      case ACTION_TYPES.DELETE_ITEM:
        return {
          ...state,
          todoList: {
            ...state.todoList,
            items: state.todoList.items.filter((item) => item.id !== action.payload),
          },
        }
      case ACTION_TYPES.TOGGLE_COMPLETED:
        return {
          ...state,
          todoList: {
            ...state.todoList,
            items: state.todoList.items.map((item) =>
              item.id === action.payload.id
                ? { ...item, completed: action.payload.updatedDoneStatus }
                : item
            ),
          },
        }
      case ACTION_TYPES.SAVE_ITEM:
        return { ...state, isSavingItemId: action.payload }
      case ACTION_TYPES.SAVE_ITEM_DONE:
        return { ...state, isSavingItemId: null }
      case ACTION_TYPES.SET_LOADING:
        return { ...state, isLoading: true }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const loadTodoList = async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING })
      try {
        const data = await fetchTodoByListId(todoListId)
        dispatch({ type: ACTION_TYPES.FETCH_SUCCESS, payload: data })
      } catch (error) {
        handleError(dispatch, error)
      }
    }
    loadTodoList()
  }, [todoListId])

  const debouncedAutosave = useMemo(
    () =>
      debounce(async (itemId, updatedText) => {
        dispatch({ type: ACTION_TYPES.SAVE_ITEM, payload: itemId })
        try {
          await autosaveTodoItem(todoListId, itemId, updatedText)
        } catch (error) {
          handleError(dispatch, error)
        } finally {
          dispatch({ type: ACTION_TYPES.SAVE_ITEM_DONE })
        }
      }, 1000),
    [todoListId]
  )

  const handleAddItem = async () => {
    try {
      const newItem = await addTodoItem(todoListId)
      dispatch({ type: ACTION_TYPES.ADD_ITEM, payload: newItem })
    } catch (error) {
      handleError(dispatch, error)
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteTodoItem(todoListId, itemId)
      dispatch({ type: ACTION_TYPES.DELETE_ITEM, payload: itemId })
    } catch (error) {
      handleError(dispatch, error)
    }
  }

  const handleToggleDone = async (itemId, currentDoneStatus) => {
    const updatedDoneStatus = !currentDoneStatus
    dispatch({ type: ACTION_TYPES.TOGGLE_COMPLETED, payload: { id: itemId, updatedDoneStatus } })
    try {
      await toggleTodoItem(todoListId, itemId, updatedDoneStatus)
    } catch (error) {
      handleError(dispatch, error)
    }
  }

  return { state, dispatch, handleAddItem, handleDeleteItem, handleToggleDone, debouncedAutosave }
}

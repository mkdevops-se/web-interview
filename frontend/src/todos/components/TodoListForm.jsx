import React from 'react'
import {
  Card,
  Alert,
  CardContent,
  Box,
  CircularProgress,
  CardActions,
  Button,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { useTodoList } from '../hooks/useTodoList'
import { TodoItem } from './TodoItem'

export const TodoListForm = ({ todoListId }) => {
  const { state, dispatch, debouncedAutosave, handleDeleteItem, handleAddItem, handleToggleDone } =
    useTodoList(todoListId)

  if (state.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (state.error) {
    return <Alert severity='error'>{state.error}</Alert>
  }

  const handleTitleUpdate = (itemId, updatedText) => {
    dispatch({ type: 'SAVE_ITEM', payload: itemId })
    const updatedTodoList = {
      ...state.todoList,
      items: state.todoList.items.map((item) =>
        item.id === itemId ? { ...item, itemTitle: updatedText } : item
      ),
    }
    dispatch({ type: 'FETCH_SUCCESS', payload: updatedTodoList })
    debouncedAutosave(itemId, updatedText)
  }

  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2'>{state.todoList.title}</Typography>
        <form style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {state.todoList.items.length === 0 ? (
            <Typography sx={{ margin: '8px' }}>The todo list is empty. Add a new TODO!</Typography>
          ) : (
            state.todoList.items.map(({ id, completed, itemTitle }, index) => (
              <TodoItem
                key={id}
                id={id}
                index={index}
                itemTitle={itemTitle}
                completed={completed}
                isSavingItemId={state.isSavingItemId}
                handleTitleUpdate={handleTitleUpdate}
                handleDeleteItem={handleDeleteItem}
                handleToggleDone={handleToggleDone}
              />
            ))
          )}
        </form>
      </CardContent>
      <CardActions>
        <Button type='button' color='primary' onClick={handleAddItem}>
          Add Todo <AddIcon />
        </Button>
      </CardActions>
    </Card>
  )
}

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardActions, Button, Typography } from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import TodoItem from './TodoItem'
import AddIcon from '@mui/icons-material/Add'
import {
  fetchTodoByListId,
  addTodoItem,
  deleteTodoItem,
  reorderTodoItems,
} from '../api/todoService'

export const TodoListForm = ({ todoListId }) => {
  const [todoListTitle, setTodoListTitle] = useState()
  const [todoListItems, setTodoListItems] = useState()
  const [backupItems, setBackupItems] = useState()

  useEffect(() => {
    const loadTodoList = async () => {
      try {
        const data = await fetchTodoByListId(todoListId)
        setTodoListTitle(data.title)
        setTodoListItems(data.items)
      } catch (error) {
        console.error(error)
      }
    }
    loadTodoList()
  }, [todoListId])

  if (!todoListItems || !todoListTitle) return null

  const handleAddItem = async () => {
    try {
      const itemAdded = await addTodoItem(todoListId)
      setTodoListItems((prevTodoItemsState) => [...prevTodoItemsState, itemAdded])
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteTodoItem(todoListId, itemId)

      setTodoListItems((prevTodoListState) =>
        prevTodoListState.filter((item) => item.id !== itemId)
      )
    } catch (error) {
      console.error(error)
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination } = result

    // Create a new array with the reordered items
    const newItems = Array.from(todoListItems)
    const [reorderedItem] = newItems.splice(source.index, 1)
    newItems.splice(destination.index, 0, reorderedItem)

    // Optimistically update the local state to give user instant feedback
    setBackupItems(todoListItems)
    setTodoListItems(newItems)

    try {
      // Call API to persist the new order
      await reorderTodoItems(
        todoListId,
        newItems.map((item) => item.id)
      )
    } catch (error) {
      console.error('Error reordering items:', error)
      // Revert local state if API call fails
      setTodoListItems(backupItems)
    }
  }

  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2'>{todoListTitle}</Typography>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='todo-list'>
            {(provided) => (
              <form
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
              >
                {todoListItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TodoItem
                          item={item}
                          index={index}
                          todoListId={todoListId}
                          handleDeleteItem={handleDeleteItem}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </form>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
      <CardActions>
        <Button type='button' color='primary' onClick={handleAddItem}>
          Add Todo <AddIcon />
        </Button>
      </CardActions>
    </Card>
  )
}

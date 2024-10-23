import React, { Fragment, useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
} from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { TodoListForm } from './TodoListForm'
import axios from 'axios'

const getBaseUrl = () => {
  // FIXME(@okaziya): Hack to make the frontend work until something more beautiful comes in #9
  if (window.location.href.startsWith('http://localhost:3000')) {
    return 'http://localhost:3001'
  } else {
    return ''
  }
}
axios.defaults.baseURL = getBaseUrl();

export const TodoLists = ({ style }) => {
  const [todoLists, setTodoLists] = useState()
  const [activeList, setActiveList] = useState()

  useEffect(() => {
    const fetchTodoLists = async () => {
      try {
        const response = await axios.get('/api/todo-lists')
        setTodoLists(response.data)
      } catch (error) {
        console.error('Error fetching todo lists:', error)
      }
    }
    fetchTodoLists()
  }, [])

  if (!todoLists?.length) return null
  return (
    <Fragment>
      <Card style={style}>
        <CardContent>
          <Typography component='h2'>My Todo Lists</Typography>
          <List>
            {todoLists.map((list) => (
              <ListItemButton key={list.id} onClick={() => setActiveList(list)}>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary={list.title} />
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>
      {activeList && (
        <TodoListForm
          key={activeList.id} // use key to make React recreate component to reset internal state
          todoListId={activeList.id}
        />
      )}
    </Fragment>
  )
}

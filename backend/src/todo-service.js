import { getAppDataSource } from './data-source.js'
import { TodoList } from './todo-list.js'
import { TodoItem } from './todo-item.js'

export const fetchTodoLists = async () => {
  const AppDataSource = await getAppDataSource()
  return AppDataSource.getRepository(TodoList).find()
}

export const fetchTodoListById = async (listId) => {
  const AppDataSource = await getAppDataSource()
  return AppDataSource.getRepository(TodoList).findOne({
    where: { id: listId },
    relations: ['items']
  })
}

export const createTodoItem = async (listId, todoItemData) => {
  const AppDataSource = await getAppDataSource()
  const todoListRepository = AppDataSource.getRepository(TodoList)
  const todoItemRepository = AppDataSource.getRepository(TodoItem)
  
  const todoList = await todoListRepository.findOneBy({ id: listId })
  if (!todoList) throw new Error(`Todo list ${listId} not found`)
  
  const maxOrderItem = await todoItemRepository.findOne({
    where: { list: { id: listId } },
    order: { order: 'DESC' }
  })
  
  const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 0
  
  const todoItem = todoItemRepository.create({ 
    ...todoItemData, 
    list: todoList,
    order: newOrder 
  })
  
  return todoItemRepository.save(todoItem)
}

export const fetchTodoItemById = async (listId, itemId) => {
  const AppDataSource = await getAppDataSource()
  return AppDataSource.getRepository(TodoItem).findOne({
    where: { id: itemId, list: { id: listId } }
  })
}

export const updateTodoItem = async (listId, itemId, updateData) => {
  const AppDataSource = await getAppDataSource()
  const todoRepository = AppDataSource.getRepository(TodoItem)

  const todoItem = await todoRepository.findOne({
    where: { id: itemId, list: { id: listId } }
  })
  if (!todoItem) throw new Error(`Todo item ${itemId} not found in list ${listId}`)

  const updatedTodoItem = todoRepository.merge(todoItem, updateData)
  return todoRepository.save(updatedTodoItem)
}

export const deleteTodoItem = async (listId, itemId) => {
  const AppDataSource = await getAppDataSource()
  const todoRepository = AppDataSource.getRepository(TodoItem)

  const todoItem = await todoRepository.findOne({
    where: { id: itemId, list: { id: listId } }
  })
  if (!todoItem) throw new Error(`Todo item ${itemId} not found in list ${listId}`)

  await todoRepository.delete(itemId)
  return todoItem
}

export const reorderTodoItems = async (listId, itemIds) => {
  const AppDataSource = await getAppDataSource()
  const todoItemRepository = AppDataSource.getRepository(TodoItem)
  
  try {
    const todoItems = await todoItemRepository.find({
      where: { list: { id: listId } }
    })
    
    // Use Promise.all for concurrent updates
    await Promise.all(itemIds.map(async (itemId, index) => {
      const todoItem = todoItems.find(item => item.id === parseInt(itemId))
      
      if (todoItem) {
        todoItem.order = index
        await todoItemRepository.save(todoItem)
      }
    }))
    
    return todoItemRepository.find({
      where: { list: { id: listId } },
      order: { order: 'ASC' }
    })
  } catch (error) {
    console.error('Error reordering items:', error)
    throw error
  }
}
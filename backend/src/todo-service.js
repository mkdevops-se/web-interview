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
    relations: ['items'],
  })
}

export const createTodoItem = async (listId, todoItemData) => {
  const AppDataSource = await getAppDataSource()
  const todoList = await AppDataSource.getRepository(TodoList).findOneBy({ id: listId })
  if (!todoList) throw new Error(`Todo list ${listId} not found`)

  const todoItem = AppDataSource.getRepository(TodoItem).create({ ...todoItemData, list: todoList })
  return AppDataSource.getRepository(TodoItem).save(todoItem)
}

export const fetchTodoItemById = async (listId, itemId) => {
  const AppDataSource = await getAppDataSource()
  return AppDataSource.getRepository(TodoItem).findOne({
    where: { id: itemId, list: { id: listId } },
  })
}

export const updateTodoItem = async (listId, itemId, updateData) => {
  console.log('*** updateTodoItem', listId, itemId, updateData)
  const AppDataSource = await getAppDataSource()
  const todoRepository = AppDataSource.getRepository(TodoItem)
  const todoListRepository = AppDataSource.getRepository(TodoList)

  const todoItem = await todoRepository.findOne({
    where: { id: itemId, list: { id: listId } },
  })
  if (!todoItem) throw new Error(`Todo item ${itemId} not found in list ${listId}`)

  const updatedTodoItem = todoRepository.merge(todoItem, updateData)

  const updatedTodoItem = await todoRepository.save(todoRepository.merge(todoItem, updateData))
  console.log('updatedTodoItem in memory and in database:', updatedTodoItem)
  // Item updates done. Time to check the list.



  if (updatedTodoItem.completed === true) {
    const result = await todoListRepository.findOne({
      where: { id: listId },
      relations: ['items'],
    })

    console.log('result', result)

    const notCompletedItems = result.items.filter((item) => item.completed === false)

    console.log('notCompletedItems', notCompletedItems)

    if (notCompletedItems.length === 0) {
      await todoListRepository.update({ id: listId }, { completed: true })
    }
  }

  if (updatedTodoItem.completed === false) {
    todoListRepository.update({ id: listId }, { completed: false })
  }

  return updatedTodoItem
}

export const deleteTodoItem = async (listId, itemId) => {
  const AppDataSource = await getAppDataSource()
  const todoRepository = AppDataSource.getRepository(TodoItem)

  const todoItem = await todoRepository.findOne({
    where: { id: itemId, list: { id: listId } },
  })
  if (!todoItem) throw new Error(`Todo item ${itemId} not found in list ${listId}`)

  await todoRepository.delete(itemId)
  return todoItem
}

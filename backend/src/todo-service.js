import { getAppDataSource } from './data-source.js'
import { TodoList } from './todo-list.js'
import { TodoItem } from './todo-item.js'

const fetchAndValidateTodoItem = async (todoRepository, listId, itemId) => {
  const todoItem = await todoRepository.findOne({
    where: { id: itemId, list: { id: listId } },
  })
  if (!todoItem) throw new Error(`Todo item ${itemId} not found in list ${listId}`)
  return todoItem
}

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

export const createTodoList = async (todoListData) => {
  const AppDataSource = await getAppDataSource()
  const todoListRepository = AppDataSource.getRepository(TodoList)
  const todoList = todoListRepository.create(todoListData)
  const savedList = await todoListRepository.save(todoList)
  console.log(`List ${savedList.id} created: ${JSON.stringify(savedList)}`)
  return savedList
}

export const createTodoItem = async (listId, todoItemData) => {
  const AppDataSource = await getAppDataSource()
  const todoListRepository = AppDataSource.getRepository(TodoList)
  const todoRepository = AppDataSource.getRepository(TodoItem)

  const todoList = await todoListRepository.findOneBy({ id: listId })
  if (!todoList) throw new Error(`Todo list ${listId} not found`)

  const todoItem = todoRepository.create({ ...todoItemData, list: todoList })
  const savedItem = await todoRepository.save(todoItem)

  if (todoList.completed) {
    await todoListRepository.update({ id: listId }, { completed: false })
    console.log(`List ${listId} marked as incomplete after adding a new item`)
  }

  return savedItem
}

export const fetchTodoItemById = async (listId, itemId) => {
  const AppDataSource = await getAppDataSource()
  return AppDataSource.getRepository(TodoItem).findOne({
    where: { id: itemId, list: { id: listId } },
  })
}

const markListAsCompletedIfAllItemsCompleted = async (todoListRepository, listId) => {
  const todoList = await todoListRepository.findOne({
    where: { id: listId },
    relations: ['items'],
  })

  if (todoList) {
    const hasIncompleteItems = todoList.items.some((item) => !item.completed)
    if (!hasIncompleteItems || todoList.items.length === 0) {
      await todoListRepository.update({ id: listId }, { completed: true })
      console.log(`List ${listId} marked as completed`)
    }
  }
}

const handleListCompletionStatus = async (todoListRepository, listId, itemCompleted) => {
  if (itemCompleted) {
    await markListAsCompletedIfAllItemsCompleted(todoListRepository, listId)
  } else {
    await todoListRepository.update({ id: listId }, { completed: false })
  }
}

export const updateTodoItem = async (listId, itemId, updateData) => {
  const AppDataSource = await getAppDataSource()
  const todoRepository = AppDataSource.getRepository(TodoItem)
  const todoListRepository = AppDataSource.getRepository(TodoList)

  const todoItem = await fetchAndValidateTodoItem(todoRepository, listId, itemId)

  const updatedTodoItem = await todoRepository.save(todoRepository.merge(todoItem, updateData))

  await handleListCompletionStatus(todoListRepository, listId, updateData.completed)

  return updatedTodoItem
}

export const deleteTodoItem = async (listId, itemId) => {
  const AppDataSource = await getAppDataSource()
  const todoRepository = AppDataSource.getRepository(TodoItem)
  const todoListRepository = AppDataSource.getRepository(TodoList)

  const todoItem = await fetchAndValidateTodoItem(todoRepository, listId, itemId)

  await todoRepository.delete(itemId)

  await markListAsCompletedIfAllItemsCompleted(todoListRepository, listId)

  return todoItem
}

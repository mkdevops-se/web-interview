import { DataSource } from 'typeorm'
import { TodoList } from './todo-list.js'
import { TodoItem } from './todo-item.js'

let dataSource = null

const seedData = async (dataSource) => {
  const todoListRepository = dataSource.getRepository(TodoList)
  const todoItemRepository = dataSource.getRepository(TodoItem)
  const firstList = await todoListRepository.save({ title: 'First List' })
  await todoItemRepository.save({ itemTitle: 'First todo of first list!', list: firstList })
  const secondList = await todoListRepository.save({ title: 'Second List' })
  await todoItemRepository.save({ itemTitle: 'First todo of second list!', list: secondList })
}

export const getAppDataSource = async () => {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'sqljs',
      location: './todo.db',
      synchronize: true,
      entities: [TodoList, TodoItem],
      logging: false,
    })
    await dataSource.initialize()
    await seedData(dataSource)
  }
  return dataSource
}

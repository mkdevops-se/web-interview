import { EntitySchema } from 'typeorm'

export const TodoList = new EntitySchema({
  name: 'TodoList',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    title: {
      type: String,
      nullable: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  relations: {
    items: {
      type: 'one-to-many',
      target: 'TodoItem',
      inverseSide: 'list', // This matches the 'list' relation in TodoItem
      cascade: true,
    },
  },
})

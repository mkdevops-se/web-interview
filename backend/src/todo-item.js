import { EntitySchema } from 'typeorm'

export const TodoItem = new EntitySchema({
  name: 'TodoItem',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    itemTitle: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      nullable: false,
    },
  },
  relations: {
    list: {
      type: 'many-to-one',
      target: 'TodoList', // This references the TodoList entity
      joinColumn: true, // This specifies that 'list' is a foreign key
      nullable: false,
      eager: true,
    },
  },
})

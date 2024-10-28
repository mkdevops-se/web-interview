import request from 'supertest'
import app from '../app.js'

describe('App API Endpoints', () => {
  const seedListOneId = 1

  it('should respond with Pong! on /ping', async () => {
    const res = await request(app).get('/ping')
    expect(res.status).toBe(200)
    expect(res.text).toBe('Pong!')
  })

  describe('GET /api/todo-lists', () => {
    it('should return a list of default todo lists with sample items', async () => {
      const res = await request(app).get('/api/todo-lists')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([
        { id: 1, title: 'First List', completed: false },
        { id: 2, title: 'Second List', completed: false },
      ])
    })
  })

  describe('POST /api/todo-list', () => {
    it('should return create a todo list', async () => {
      const todoList = { title: 'Liza was here.', completed: true }
      const res = await request(app).post('/api/todo-list').send(todoList)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(expect.objectContaining(todoList))
    })
  })

  describe('GET /api/todo-list/:listId', () => {
    it('should return a specific todo list with items', async () => {
      const res = await request(app).get(`/api/todo-list/${seedListOneId}`)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: 1,
        title: 'First List',
        completed: false,
        items: [
          expect.objectContaining({
            id: 1,
            itemTitle: 'First todo of first list!',
          }),
        ],
      })
    })
  })

  describe('POST /api/todo-list/:listId/item', () => {
    let testListId
    const testTodoList = { title: 'The POST list!', completed: true }

    beforeEach(async () => {
      const res = await request(app).post('/api/todo-list').send(testTodoList)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(testTodoList)
      testListId = res.body.id
    })

    it('should add a new todo item to a specific list', async () => {
      const postRes = await request(app)
        .post(`/api/todo-list/${testListId}/item`)
        .send({ itemTitle: 'New Item' })
      expect(postRes.status).toBe(200)
      const getRes = await request(app).get(`/api/todo-list/${testListId}/item/${postRes.body.id}`)
      expect(getRes.body).toMatchObject({
        itemTitle: 'New Item',
        list: { id: testListId, title: testTodoList.title },
      })
    })

    it('should mark the list as incomplete after adding a new item', async () => {
      const postRes = await request(app)
        .post(`/api/todo-list/${testListId}/item`)
        .send({ itemTitle: 'New Incomplete Item' })
      expect(postRes.status).toBe(200)

      const listAfter = await request(app).get(`/api/todo-list/${testListId}`)
      expect(listAfter.body).toMatchObject({
        id: testListId,
        completed: false,
      })
    })
  })

  describe('PATCH /api/todo-list/:listId/item/:itemId', () => {
    let testListId
    const testTodoList = { title: 'The PATCH list!', completed: true }

    beforeEach(async () => {
      const res = await request(app).post('/api/todo-list').send(testTodoList)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(testTodoList)
      testListId = res.body.id
    })

    const createItem = async (data) => {
      return await request(app).post(`/api/todo-list/${testListId}/item`).send(data)
    }

    const patchItem = async (itemId, data) => {
      return await request(app).patch(`/api/todo-list/${testListId}/item/${itemId}`).send(data)
    }

    const getList = async () => {
      return await request(app).get(`/api/todo-list/${testListId}`)
    }

    it('should update a specific todo item in a list', async () => {
      const postRes = await createItem({ itemTitle: 'New Item', completed: true })
      expect(postRes.status).toBe(200)

      const patchRes = await patchItem(postRes.body.id, { itemTitle: 'Updated Item' })
      expect(patchRes.status).toBe(200)

      expect(patchRes.body).toMatchObject({ itemTitle: 'Updated Item', completed: true })

      const getRes = await request(app).get(`/api/todo-list/${testListId}/item/${patchRes.body.id}`)
      expect(getRes.body).toMatchObject(patchRes.body)
    })

    it('should update list completed status to true when all items are completed', async () => {
      const res = await getList(testListId)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: testListId,
        title: testTodoList.title,
        completed: true,
        items: expect.any(Array),
      })

      const postRes = await createItem({ itemTitle: 'New Item', completed: true })
      expect(postRes.status).toBe(200)

      const patchRes = await patchItem(postRes.body.id, {
        itemTitle: 'First todo updated to completed',
        completed: true,
      })
      expect(patchRes.status).toBe(200)
      expect(patchRes.body).toMatchObject({ completed: true })

      const patchResFirstItem = await patchItem(postRes.body.id, { completed: true })
      expect(patchResFirstItem.status).toBe(200)

      const resAfter = await getList()
      expect(resAfter.body).toMatchObject({ completed: true })
    })

    it('should update list completed status to False when one or more items are incomplete', async () => {
      const res = await getList(testListId)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: testListId,
        title: testTodoList.title,
        completed: true,
        items: expect.any(Array),
      })

      const postRes = await createItem({ itemTitle: 'New Item', completed: true })
      expect(postRes.status).toBe(200)

      const patchRes = await patchItem(postRes.body.id, {
        itemTitle: 'First todo updated to incomplete',
        completed: false,
      })
      expect(patchRes.status).toBe(200)
      expect(patchRes.body).toMatchObject({ completed: false })

      const resAfter = await getList()
      expect(resAfter.body).toMatchObject({ completed: false })
    })

    it('should keep list completed status as false when not all items are completed', async () => {
      const itemOneRes = await createItem({
        itemTitle: 'Incomplete Item',
        completed: false,
      })
      expect(itemOneRes.status).toBe(200)

      const itemTwoRes = await createItem({
        itemTitle: 'Completed Item',
        completed: true,
      })
      expect(itemTwoRes.status).toBe(200)

      const resAfter = await getList(seedListOneId)

      expect(resAfter.body).toMatchObject({
        completed: false,
        items: expect.arrayContaining([
          expect.objectContaining({ id: itemOneRes.body.id, completed: false }),
          expect.objectContaining({ id: itemTwoRes.body.id, completed: true }),
        ]),
      })
    })
  })

  describe('DELETE /api/todo-list/:listId/item/:itemId', () => {
    it('should delete a specific todo item in a list', async () => {
      const postRes = await request(app)
        .post(`/api/todo-list/${seedListOneId}/item`)
        .send({ itemTitle: 'New Item' })
      expect(postRes.status).toBe(200)

      const deleteRes = await request(app).delete(`/api/todo-list/1/item/${postRes.body.id}`)
      expect(deleteRes.status).toBe(200)
      expect(deleteRes.body.id).toEqual(postRes.body.id)
    })

    it('should update list completed status to true if all remaining items are completed after deletion', async () => {
      const testTodoList = { title: 'The POST list!', completed: true }

      const res = await request(app).post('/api/todo-list').send(testTodoList)
      expect(res.status).toBe(200)

      const testListId = res.body.id

      const itemRes = await request(app)
        .post(`/api/todo-list/${testListId}/item`)
        .send({ itemTitle: 'Completed Item' })
      expect(itemRes.status).toBe(200)

      const deleteRes = await request(app).delete(
        `/api/todo-list/${testListId}/item/${itemRes.body.id}`
      )

      expect(deleteRes.status).toBe(200)
      expect(deleteRes.body.id).toEqual(itemRes.body.id)

      const listRes = await request(app).get(`/api/todo-list/${testListId}`)
      expect(listRes.body).toMatchObject({
        completed: true,
      })
    })
  })
})

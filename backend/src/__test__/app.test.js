import request from 'supertest'
import app from '../app.js'

describe('App API Endpoints', () => {
  it('should respond with Pong! on /ping', async () => {
    const res = await request(app).get('/ping')
    expect(res.status).toBe(200)
    expect(res.text).toBe('Pong!')
  })
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

describe('GET /api/todo-list/:listId', () => {
  it('should return a specific todo list with items', async () => {
    const res = await request(app).get(`/api/todo-list/1`)
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
  it('should add a new todo item to a specific list', async () => {
    const postRes = await request(app).post(`/api/todo-list/1/item`).send({ itemTitle: 'New Item' })
    expect(postRes.status).toBe(200)
    const getRes = await request(app).get(`/api/todo-list/1/item/${postRes.body.id}`)
    expect(getRes.body).toMatchObject({
      itemTitle: 'New Item',
      list: { id: 1, title: 'First List' },
    })
  })
})

describe('PATCH /api/todo-list/:listId/item/:itemId', () => {
  const listOneId = 1
  const listTwoId = 2
  it('should update a specific todo item in a list', async () => {
    const postRes = await request(app)
      .post(`/api/todo-list/${listOneId}/item`)
      .send({ itemTitle: 'New Item', completed: true })
    expect(postRes.status).toBe(200)

    const patchRes = await request(app)
      .patch(`/api/todo-list/${listOneId}/item/${postRes.body.id}`)
      .send({ itemTitle: 'Updated Item' })
    expect(patchRes.status).toBe(200)

    expect(patchRes.body).toMatchObject({ itemTitle: 'Updated Item', completed: true })

    const getRes = await request(app).get(`/api/todo-list/${listOneId}/item/${patchRes.body.id}`)
    expect(getRes.body).toMatchObject(patchRes.body)
  })

  it('should update list completed status to True when all items are completed', async () => {
    const itemTwoId = 2
    const res = await request(app).get(`/api/todo-list/${listTwoId}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: listTwoId,
      title: 'Second List',
      completed: false,
      items: [
        expect.objectContaining({
          id: itemTwoId,
          itemTitle: 'First todo of second list!',
          completed: false
        }),
      ],
    })

    // add new item #3 with completed status TRUE
    const postRes = await request(app)
      .post(`/api/todo-list/${listTwoId}/item`)
      .send({ itemTitle: 'New Item, probably with ID 3', completed: true })
    expect(postRes.status).toBe(200)

    const patchRes = await request(app)
      .patch(`/api/todo-list/${listTwoId}/item/${itemTwoId}`)
      .send({ itemTitle: 'First todo of second list! But updated. :)', completed: true })
    expect(patchRes.status).toBe(200)
    expect(patchRes.body).toMatchObject({ completed: true })

    // update previous item with completed status TRUE

    const patchResFirstItem = await request(app)
      .patch(`/api/todo-list/${listTwoId}/item/${itemTwoId}`)
      .send({ completed: true })
    expect(patchResFirstItem.status).toBe(200)

    // check if the list is in status completed TRUE
    const resAfter = await request(app).get(`/api/todo-list/${listTwoId}`)
    console.log('*** 3', resAfter.body)
    expect(resAfter.body).toMatchObject({
      completed: true,
    })
  })

  it('should update list completed status to False when one or more items are incomplete', async () => {
    const res = await request(app).get(`/api/todo-list/2`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: 2,
      title: 'Second List',
      completed: true,
      items: expect.any(Array)
    })

    const patchRes = await request(app)
      .patch(`/api/todo-list/${res.body.id}/item/${res.body.items[0].id}`)
      .send({ itemTitle: 'Destroyed the completed state! :)', completed: false })
    expect(patchRes.status).toBe(200)
    expect(patchRes.body).toMatchObject({ completed: false })

    // Now something is broken in the completed world.
    const resAfter = await request(app).get(`/api/todo-list/${res.body.id}`)
    expect(resAfter.body).toMatchObject({
      completed: false,
    })
  })
})

describe('DELETE /api/todo-list/:listId/item/:itemId', () => {
  it('should delete a specific todo item in a list', async () => {
    const postRes = await request(app).post(`/api/todo-list/1/item`).send({ itemTitle: 'New Item' })
    expect(postRes.status).toBe(200)

    const deleteRes = await request(app).delete(`/api/todo-list/1/item/${postRes.body.id}`)
    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body.id).toEqual(postRes.body.id)
  })
})

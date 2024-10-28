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
  it('should update a specific todo item in a list', async () => {
    const postRes = await request(app)
      .post(`/api/todo-list/1/item`)
      .send({ itemTitle: 'New Item', completed: true })
    expect(postRes.status).toBe(200)

    const patchRes = await request(app)
      .patch(`/api/todo-list/1/item/${postRes.body.id}`)
      .send({ itemTitle: 'Updated Item' })
    expect(patchRes.status).toBe(200)

    expect(patchRes.body).toMatchObject({ itemTitle: 'Updated Item', completed: true })

    const getRes = await request(app).get(`/api/todo-list/1/item/${patchRes.body.id}`)
    expect(getRes.body).toMatchObject(patchRes.body)
  })

  it('should update completed status in a list when all items are compleated', async () => {
    const res = await request(app).get(`/api/todo-list/2`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: 2,
      title: 'Second List',
      completed: false,
      items: [
        expect.objectContaining({
          id: 2,
          itemTitle: 'First todo of second list!',
          completed: false
        }),
      ],
    })

    // add new item #3 with completed status TRUE
    const postRes = await request(app)
      .post(`/api/todo-list/2/item`)
      .send({ itemTitle: 'New Item, probably with ID 3', completed: true })
    expect(postRes.status).toBe(200)

    console.log('*** 1', postRes.body)

    const patchRes = await request(app)
      .patch(`/api/todo-list/2/item/2`)
      .send({ itemTitle: 'First todo of second list! But updated. :)', completed: true })
    expect(patchRes.status).toBe(200)

    console.log('*** 2', patchRes.body)
    expect(patchRes.body).toMatchObject({ completed: true })

    // check if the list is in status completed FALSE

    const resBefore = await request(app).get(`/api/todo-list/2`)
    expect(resBefore.body).toMatchObject({
      completed: false,
    })

    console.log('*** resBefore', resBefore.body)

    // update previous item with completed status TRUE

    const patchResFirstItem = await request(app)
      .patch(`/api/todo-list/2/item/2`)
      .send({ completed: true })
    expect(patchResFirstItem.status).toBe(200)

    // check if the list is in status completed TRUE

    const resAfter = await request(app).get(`/api/todo-list/2`)
    console.log('*** 3', resAfter.body)
    expect(resAfter.body).toMatchObject({
      completed: true,
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

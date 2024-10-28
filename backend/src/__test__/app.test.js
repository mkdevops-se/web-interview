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
  const listOneId = 1;

  const listTwoId = 2;

  it('should add a new todo item to a specific list', async () => {
    const postRes = await request(app).post(`/api/todo-list/${listOneId}/item`).send({ itemTitle: 'New Item' })
    expect(postRes.status).toBe(200)
    const getRes = await request(app).get(`/api/todo-list/${listOneId}/item/${postRes.body.id}`)
    expect(getRes.body).toMatchObject({
      itemTitle: 'New Item',
      list: { id: listOneId, title: 'First List' },
    })
  })

  it('should mark the list as incomplete after adding a new item', async () => {
    const listId = 2;

    // Step 1: Add items and mark them as completed to ensure the list is completed
    const itemOne = await request(app).post(`/api/todo-list/${listId}/item`).send({ itemTitle: 'Item 1', completed: true });
    const itemTwo = await request(app).post(`/api/todo-list/${listId}/item`).send({ itemTitle: 'Item 2', completed: true });
    expect(itemOne.status).toBe(200);
    expect(itemTwo.status).toBe(200);

    // Verify the list is now completed
    const listBefore = await request(app).get(`/api/todo-list/${listId}`);
    expect(listBefore.body).toMatchObject({
      id: listId,
      completed: true,
    });

    // Step 2: Add a new item to the list
    const postRes = await request(app).post(`/api/todo-list/${listId}/item`).send({ itemTitle: 'New Incomplete Item' });
    expect(postRes.status).toBe(200);

    // Step 3: Check if the list is now marked as incomplete
    const listAfter = await request(app).get(`/api/todo-list/${listId}`);
    expect(listAfter.body).toMatchObject({
      id: listId,
      completed: false,
    });
  });
})

describe('PATCH /api/todo-list/:listId/item/:itemId', () => {
  const listOneId = 1
  const listTwoId = 2

  const itemTwoId = 2

  const createItem = async (listId, data) => {
    return await request(app).post(`/api/todo-list/${listId}/item`).send(data);
  };

  const patchItem = async (listId, itemId, data) => {
    return await request(app).patch(`/api/todo-list/${listId}/item/${itemId}`).send(data);
  };

  const getList = async (listId) => {
    return await request(app).get(`/api/todo-list/${listId}`);
  };


  it('should update a specific todo item in a list', async () => {
    const postRes = await createItem(listOneId, { itemTitle: 'New Item', completed: true });
    expect(postRes.status).toBe(200)

    const patchRes = await patchItem(listOneId, postRes.body.id, { itemTitle: 'Updated Item' });
    expect(patchRes.status).toBe(200);

    expect(patchRes.body).toMatchObject({ itemTitle: 'Updated Item', completed: true })

    const getRes = await request(app).get(`/api/todo-list/${listOneId}/item/${patchRes.body.id}`)
    expect(getRes.body).toMatchObject(patchRes.body)
  })

  it('should update list completed status to true when all items are completed', async () => {
    const res = await getList(listTwoId);
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

    const postRes = await createItem(listTwoId, { itemTitle: 'New Item', completed: true });
    expect(postRes.status).toBe(200)

    const patchRes = await patchItem(listTwoId, itemTwoId, { itemTitle: 'First todo updated', completed: true });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body).toMatchObject({ completed: true })

    const patchResFirstItem = await patchItem(listTwoId, itemTwoId, { completed: true });
    expect(patchResFirstItem.status).toBe(200);

    const resAfter = await getList(listTwoId);
    expect(resAfter.body).toMatchObject({ completed: true });
  })

  it('should update list completed status to False when one or more items are incomplete', async () => {
    const res = await getList(listTwoId);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: listTwoId,
      title: 'Second List',
      completed: true,
      items: expect.any(Array),
    });

    const patchRes = await patchItem(listTwoId, res.body.items[0].id, { itemTitle: 'Incomplete', completed: false });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body).toMatchObject({ completed: false });

    const resAfter = await getList(listTwoId);
    expect(resAfter.body).toMatchObject({ completed: false });
  });

  it('should keep list completed status as False when not all items are completed', async () => {
    const listId = listOneId;

    const itemOneRes = await createItem(listId, { itemTitle: 'Incomplete Item', completed: false });
    expect(itemOneRes.status).toBe(200);

    const itemTwoRes = await createItem(listId, { itemTitle: 'Completed Item', completed: true });
    expect(itemTwoRes.status).toBe(200);

    const resAfter = await getList(listId);
    expect(resAfter.body).toMatchObject({
      completed: false,
      items: expect.arrayContaining([
        expect.objectContaining({ id: itemOneRes.body.id, completed: false }),
        expect.objectContaining({ id: itemTwoRes.body.id, completed: true })
      ]),
    });
  });
})

describe('DELETE /api/todo-list/:listId/item/:itemId', () => {
  it('should delete a specific todo item in a list', async () => {
    const postRes = await request(app).post(`/api/todo-list/1/item`).send({ itemTitle: 'New Item' })
    expect(postRes.status).toBe(200)

    const deleteRes = await request(app).delete(`/api/todo-list/1/item/${postRes.body.id}`)
    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body.id).toEqual(postRes.body.id)
  })

  it('should update list completed status to true if all remaining items are completed after deletion', async () => {
    const listId = 2;

    // Step 1: Create two items, one completed and one incomplete
    const itemOneRes = await request(app)
      .post(`/api/todo-list/${listId}/item`)
      .send({ itemTitle: 'Incomplete Item', completed: false });
    expect(itemOneRes.status).toBe(200);

    const itemTwoRes = await request(app)
      .post(`/api/todo-list/${listId}/item`)
      .send({ itemTitle: 'Completed Item', completed: true });
    expect(itemTwoRes.status).toBe(200);

    // Step 2: Delete the incomplete item
    const deleteRes = await request(app).delete(`/api/todo-list/${listId}/item/${itemOneRes.body.id}`);

    console.log("deleteRes", deleteRes.body)
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.id).toEqual(itemOneRes.body.id);

    // Step 3: Check if the list status is now completed
    const listRes = await request(app).get(`/api/todo-list/${listId}`);
    expect(listRes.body).toMatchObject({
      id: listId,
      completed: true,
    });
  });
})

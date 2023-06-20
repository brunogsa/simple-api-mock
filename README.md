A simple API mock using express.js, for faster UI development.

Features:
- Has a simple DB kept in memory, and sync it to `db.json`, so you can reload your app without losing your state
- Hot reload
- Automatically logs info about requests and response
- Can live watch the DB content
- Customize `index.js` via express to your needs

How to use:
```
$ npm install
$ npm start  // Starts on localhost:3333, has hot-reload on index.js and db.json

$ npm run lint
$ npm run watch:db  // Live print of the DB content
```

Examples for fast prototyping:
```js
// GET
app.get('/api/data/:id', async (req, res) => {
  // Example for getting params from path
  const id = req.params.id;

  // Extract data from headers
  const customHeader = req.headers['custom-header'];

  // Extract data from query string
  const page = req.query.page;

  console.log(customHeader, page);

  if (db[id]) {
    res.json(db[id]);
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});

// POST
app.post('/api/data', async (req, res) => {
  const data = req.body; // Example for gettings params from body
  //
  const id = data.id;
  db[id] = data;

  await syncJsonDb();
  res.status(201).json({ message: 'Data created' });
});

// PUT
app.put('/api/data/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  db[id] = data;

  await syncJsonDb();
  res.status(200).json({ message: 'Data updated' });
});

// PATCH
app.patch('/api/data/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  if (db[id]) {
    db[id] = { ...db[id], ...updates };

    await syncJsonDb();
    res.status(200).json({ message: 'Data updated' });
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});

// DELETE
app.delete('/api/data/:id', async (req, res) => {
  const id = req.params.id;

  if (db[id]) {
    delete db[id];

    await syncJsonDb();
    res.status(200).json({ message: 'Data deleted' });
  } else {
    res.status(404).json({ error: 'Data not found' });
  }
});
```

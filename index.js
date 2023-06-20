const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const loggingMiddleware = (req, res, next) => {
  console.log(' === NEW REQUEST ===');
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request Query String:', req.query);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);

  // Wrap the res.send function to log the response information
  const originalSend = res.send;
  res.send = function (body) {
    console.log(' === SENT RESPONSE ===');
    console.log('Response Status Code:', res.statusCode);
    console.log('Response Headers:', res.getHeaders());
    console.log('Response Body:', body);

    // Call the original res.send function
    originalSend.apply(this, arguments);
  };

  // Call the next middleware or route handler
  next();
};

app.use(loggingMiddleware);

const DB_FILE = "./db.json"
const PORT = 3333;

const db = require(DB_FILE);

const syncJsonDb = async () => {
  const promise = new Promise((resolve, reject) => {
    fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  return promise;
};

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

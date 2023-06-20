const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const loggingMiddleware = (req, res, next) => {
  const uniqueId = uuidv4();

  console.log(` === NEW REQUEST: ${uniqueId} ===`);
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request Query String:', req.query);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);

  // Wrap the res.send function to log the response information
  const originalSend = res.send;
  res.send = function (body) {
    console.log(` === SENT RESPONSE: ${uniqueId} ===`);
    console.log('Response Status Code:', res.statusCode);
    console.log('Response Headers:', res.getHeaders());
    console.log('Response Body:', body);

    // Call the original res.send function
    originalSend.apply(this, arguments);
  };

  // Call the next middleware or route handler
  next();
};

const permissiveCorsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
  } else {
    next();
  }
};

app.use(loggingMiddleware);
app.use(permissiveCorsMiddleware);

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
app.get('/api/v1/category/list', async (req, res) => {
  if (!db.categories) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  res.status(200).json({
    result: db.categories,
  });
});

app.get('/api/v1/category/findCategory/:id', async (req, res) => {
  const id = req.params.id;

  if (!db.categories) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  const category = db.categories.find((category) => (category.idCategory === id));

  if (!category) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  res.status(200).json({
    result: category,
  });
});

app.get('/api/v1/customer/list', async (req, res) => {
  if (!db.customers) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  res.status(200).json({
    result: db.customers,
  });
});

app.get('/api/v1/customer/findCustomer/:id', async (req, res) => {
  const id = req.params.id;

  if (!db.customers) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  const customer = db.customers.find((customer) => (customer.idCustomer === id));

  if (!customer) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  res.status(200).json({
    result: customer,
  });
});

app.get('/api/v1/product/list', async (req, res) => {
  if (!db.products) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  res.status(200).json({
    result: db.products,
  });
});

app.get('/api/v1/product/findProduct/:id', async (req, res) => {
  const id = req.params.id;

  if (!db.products) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  const product = db.products.find((product) => (product.idProduct === id));

  if (!product) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  res.status(200).json({
    result: product,
  });
});


// POST
app.post('/api/v1/category/create', async (req, res) => {
  const data = req.body;

  const idCategory = data.idCategory || uuidv4();

  if (!db.categories) db.categories = [];
  const dataStoStore = { ...data, idCategory };
  db.categories.push(dataStoStore);

  await syncJsonDb();
  res.status(200).json({ result: dataStoStore });
});

app.post('/api/v1/customer/create', async (req, res) => {
  const data = req.body;

  const idCustomer = data.idCustomer || uuidv4();

  if (!db.customers) db.customers = [];
  const dataToStore = { ...data, idCustomer };
  db.customers.push(dataToStore);

  await syncJsonDb();
  res.status(200).json({ result: dataToStore });
});

app.post('/api/v1/product/create', async (req, res) => {
  const data = req.body;

  const idProduct = data.idProduct || uuidv4();

  if (!db.products) db.products = [];
  const dataToStore = { ...data, idProduct };
  db.products.push(dataToStore);

  await syncJsonDb();
  res.status(200).json({ result: dataToStore });
});


// PUT
app.put('/api/v1/category/update/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  if (!db.categories) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  let category = db.categories.find((category) => (category.idCategory === id));

  if (!category) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  category.nameCategory = data.nameCategory;
  category.descriptionCategory = data.descriptionCategory;

  await syncJsonDb();
  res.status(200).json({ result: category });
});

app.put('/api/v1/customer/update/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  if (!db.customers) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  let customer = db.customers.find((customer) => (customer.idCustomer === id));

  if (!customer) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  [
    "firstNameCustomer",
    "lastNameCustomer",
    "cpfCustomer",
    "birthdateCustomer",
    "dateCreatedCustomer",
    "monthlyIncomeCustomer",
    "statusCustomer",
    "emailCustomer",
    "passwordCustomer",
  ].forEach((key) => {
    customer[key] = data[key];
  });

  await syncJsonDb();
  res.status(200).json({ result: customer });
});

app.put('/api/v1/product/update/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  if (!db.products) {
    res.status(404).json({ error: 'Data not found' });
    return;
  }

  let product = db.products.find((product) => (product.idProduct === id));

  if (!product) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  [
    "nameProduct",
    "descriptionProduct",
    "costPriceProduct",
    "amountProduct",
    "dateCreatedProduct",
    "category",
  ].forEach((key) => {
    product[key] = data[key];
  });

  await syncJsonDb();
  res.status(200).json({ result: product });
});


// PATCH


// DELETE
app.delete('/api/v1/category/delete/:id', async (req, res) => {
  const id = req.params.id;

  if (!db.categories) {
    res.status(404).json({ error: 'Data not found, no categories' });
    return;
  }

  const category = db.categories.find((category) => (category.idCategory === id));

  if (!category) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  db.categories = db.categories.filter((category) => (category.idCategory !== id));
  await syncJsonDb();
  res.status(200).json({ result: { result: JSON.stringify(category) } });
});

app.delete('/api/v1/customer/delete/:id', async (req, res) => {
  const id = req.params.id;

  if (!db.customers) {
    res.status(404).json({ error: 'Data not found, no customers' });
    return;
  }

  const customer = db.customers.find((customer) => (customer.idCustomer === id));

  if (!customer) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  db.customers = db.customers.filter((customer) => (customer.idCustomer !== id));
  await syncJsonDb();
  res.status(200).json({ result: { result: JSON.stringify(customer) } });
});

app.delete('/api/v1/product/delete/:id', async (req, res) => {
  const id = req.params.id;

  if (!db.products) {
    res.status(404).json({ error: 'Data not found, no products' });
    return;
  }

  const product = db.products.find((product) => (product.idProduct === id));

  if (!product) {
    res.status(404).json({ error: `Data not found for ID ${id}` });
    return;
  }

  db.products = db.products.filter((product) => (product.idProduct !== id));
  await syncJsonDb();
  res.status(200).json({ result: { result: JSON.stringify(product) } });
});


app.use((req, res, next) => {
  res.status(501).send("Not Implemented");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

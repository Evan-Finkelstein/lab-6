const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});


app.get('/food', async (req, res) => {
  try {
    const data = await client.query(`
    select food.id, food.name, food.is_good, type.type, flavor
      from food
      join type
      on type.id = food.type_id
    
    `);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
app.get('/type', async (req, res) => {
  try {
    const data = await client.query('select * from type');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/food/:id', async (req, res) => {
  try {
    const foodId = req.params.id;

    const data = await client.query(`
      select 
        food.id, 
        food.name,
        food.is_good, 
        food.flavor,
        type.type 
      from food
      join type
      on type.id = food.type_id
      where food.id = $1
     
     
      `,
      [foodId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/food/:id', async (req, res) => {
  try {
    const name = req.body.name;
    const isGood = req.body.is_good;
    const flavor = req.body.flavor;
    const typeId = req.body.type_id;
    // const ownerId = req.body.owner_id;



    const data = await client.query(`
      UPDATE food
      SET name = $1, 
      is_good = $2,
      flavor = $3,
      type = $4
      WHERE food.id = $5
      RETURNING *
    `,
      [name, isGood, flavor, typeId, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/food/', async (req, res) => {
  try {
    const name = req.body.name;
    const isGood = req.body.is_good;
    const flavor = req.body.flavor;
    const type = req.body.type;
    const ownerId = req.body.owner_id;


    const data = await client.query(`
      INSERT INTO food (name, is_good, flavor, type, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [name, isGood, flavor, type, ownerId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.delete('/food/:id', async (req, res) => {
  try {
    const foodId = req.params.id;

    const data = await client.query(`
      DELETE from food 
      WHERE food.id=$1
      RETURNING *
    `,
      [foodId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



app.use(require('./middleware/error'));

module.exports = app;

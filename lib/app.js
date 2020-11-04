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
    const data = await client.query('SELECT * from food');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/food/:id', async (req, res) => {
  try {
    const foodId = req.params.id;

    const data = await client.query(`
        SELECT * FROM food 
        WHERE food.id=$1 
    `, [foodId]);

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
    const type = req.body.type;
    // const ownerId = req.body.owner_id;



    const data = await client.query(`
      UPDATE food
      SET name = $1, 
      is_good = $2,
      flavor = $3,
      type = $4
      WHERE food.id = $5
      RETURNING *;
    `,
      [name, isGood, flavor, type, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/food/', async (req, res) => {
  try {
    // we get all the banjo data from the POST body (i.e., from the form in react)
    const name = req.body.name;
    const isGood = req.body.is_good;
    const flavor = req.body.flavor;
    const type = req.body.type;
    const ownerId = req.body.owner_id;


    // use an insert statement to make a new banjo
    const data = await client.query(`
      INSERT INTO food (name, is_good, flavor, type, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
      [name, isGood, flavor, type, ownerId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.delete('/food/:id', async (req, res) => {
  try {
    const foodId = req.params.id;

    // use an insert statement to make a new banjo
    const data = await client.query(`
      DELETE from food 
      WHERE food.id=$1
    `,
      // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
      [foodId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



app.use(require('./middleware/error'));

module.exports = app;

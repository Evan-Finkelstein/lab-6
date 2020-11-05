require('dotenv').config();

const { execSync } = require('child_process');
const { on } = require('process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns food', async () => {

      const expectation = [
        {
          id: 1,
          name: 'pizza',
          is_good: true,
          flavor: 377,

          type: 'dinner',

        },
        {
          id: 2,
          name: 'bagle',
          is_good: true,

          flavor: 4444,
          type: 'breakfast',


        },
        {
          id: 3,
          name: 'apple',
          is_good: true,

          flavor: 10,
          type: 'fruit',


        },
        {
          id: 4,
          name: 'bacon',
          is_good: true,
          flavor: 10,
          type: 'meat',


        }
      ];


      const data = await fakeRequest(app)
        .get('/food')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns type', async () => {

      const expectation = [
        {
          id: 1,
          type: 'breakfast'
        },
        {
          id: 2,
          type: 'meat'
        },
        {
          id: 3,
          type: 'dinner'
        },
        {
          id: 4,
          type: 'fruit'
        }
      ];


      const data = await fakeRequest(app)
        .get('/type')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single food', async () => {
      const expectation = {
        id: 1,
        name: 'pizza',
        is_good: true,
        flavor: 377,
        type: 'dinner',

      };

      const data = await fakeRequest(app)
        .get('/food/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a food to the DB and returns it', async () => {
      const expectation = {
        id: 5,
        name: 'cookie',
        is_good: true,
        flavor: 377,
        type_id: 1,
        owner_id: 1,

      };

      const data = await fakeRequest(app)
        .post('/food')
        .send({
          name: 'cookie',
          is_good: true,
          flavor: 377,
          type_id: 1,
          owner_id: 1,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allFood = await fakeRequest(app)
        .get('/food')
        .expect('Content-Type', /json/)
        .expect(200);


      expect(data.body).toEqual(expectation);
      expect(allFood.body.length).toEqual(5);
    });
    test.skip('returns food', async () => {

      const expectation =
      {
        id: 1,
        name: 'a',
        is_good: false,
        flavor: 7,
        type: 'dinner',
        owner_id: 1,

      };




      const data = await fakeRequest(app)
        .put('/food/1')
        .send({
          id: 1,
          name: 'a',
          is_good: false,
          flavor: 7,
          type: 'c',
          owner_id: 1,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test.skip('returns food', async () => {

      const expectation = {
        id: 1,
        name: 'a',
        is_good: false,
        flavor: 7,
        type: 'c',
        owner_id: 1,

      };



      const data = await fakeRequest(app)
        .delete('/food/1')

        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});

require('dotenv').config();

const { execSync } = require('child_process');

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
          owner_id: 1,

        },
        {
          id: 2,
          name: 'bagle',
          is_good: true,
          flavor: 4444,
          type: 'breakfast',
          owner_id: 1,


        },
        {
          id: 3,
          name: 'apple',
          is_good: true,
          flavor: 10,
          type: 'fruit',
          owner_id: 1,


        },
        {
          id: 4,
          name: 'bacon',
          is_good: true,
          flavor: 10,
          type: 'meat',
          owner_id: 1,


        }
      ];


      const data = await fakeRequest(app)
        .get('/food')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns a single banjo', async () => {
      const expectation = {
        id: 1,
        name: 'pizza',
        is_good: true,
        flavor: 377,
        type: 'dinner',
        owner_id: 1,

      };

      const data = await fakeRequest(app)
        .get('/food/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test.only('adds a food to the DB and returns it', async () => {
      const expectation = {
        id: 5,
        name: 'cookie',
        is_good: true,
        flavor: 377,
        type: 'desert',
        owner_id: 1,

      };

      const data = await fakeRequest(app)
        .post('/food')
        .send({
          name: 'cookie',
          is_good: true,
          flavor: 377,
          type: 'desert',
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
    test('returns food', async () => {

      const expectation =
      {
        id: 1,
        name: 'a',
        is_good: false,
        flavor: 7,
        type: 'c',
        owner_id: 1,

      };




      const data = await fakeRequest(app)
        .push('/food/1')
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
    test('returns food', async () => {

      const expectation = [

        {
          id: 2,
          name: 'bagle',
          is_good: true,
          flavor: 4444,
          type: 'breakfast',
          owner_id: 1,


        },
        {
          id: 3,
          name: 'apple',
          is_good: true,
          flavor: 10,
          type: 'fruit',
          owner_id: 1,


        },
        {
          id: 4,
          name: 'bacon',
          is_good: true,
          flavor: 10,
          type: 'meat',
          owner_id: 1,


        }
      ];


      const data = await fakeRequest(app)
        .delete('/food/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});

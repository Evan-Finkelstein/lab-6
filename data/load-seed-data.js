const client = require('../lib/client');
// import our seed data:
const animals = require('./food.js');
const type = require('./type.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );



    const user = users[0].rows[0];

    await Promise.all(
      animals.map(animal => {
        return client.query(`
                    INSERT INTO food (name, is_good, flavor, type_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
          [animal.name, animal.is_good, animal.flavor, animal.type_id, user.id]);
      })
    );

    await Promise.all(
      type.map(type => {
        return client.query(`
            INSERT INTO type (type)
            VALUES ($1)
            RETURNING *;
          `,
          [type.type]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}

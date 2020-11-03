const client = require('../lib/client');
// import our seed data:
const food = require('./food.js');
// const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    // await client.connect();

    // const users = await Promise.all(
    //   usersData.map(user => {
    //     return client.query(`
    //                   INSERT INTO users (email, hash)
    //                   VALUES ($1, $2)
    //                   RETURNING *;
    //               `,
    //     [user.email, user.hash]);
    //   })
    // );



    await Promise.all(
      food.map(food => {
        return client.query(`
                    INSERT INTO animals (name, type, flavor, is_food)
                    VALUES ($1, $2, $3, $4);
                `,
          [food.name, food.type, food.flavor, food.is_food]);
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

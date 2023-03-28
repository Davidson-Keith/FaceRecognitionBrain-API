const knex = require("knex");

//-------------
// Connection
//-------------

// connection setup
// const postgres = knex({
//   client: "pg",
//   connection: process.env.PG_CONNECTION_STRING,
//   searchPath: ["knex", "public"],
// });

// alternate explicit connection setup
const pg = knex({
  client: "pg",
  version: "7.2",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "dadthelad",
    password: "",
    database: "smart-brain",
  },
});


//-------------
// Lib - Still can't get this to work. Something about need to send a promise...
//-------------

const insertUser = (name, email) => {
  pg.insert([
    {
      name: name,
      email: email,
    },
  ])
    .into("users")
    .returning(["id", "name"])
    .then((data) => {
      console.log(data);
    });
  bcrypt.hash(email, saltRounds, (err, hash) => {
    const id = pg.select("id").from("users").where("email", email);
    console.log("id:", id);
    pg.insert({
      user_id: id,
      email: email,
      hash: hash,
    })
      .into("logins")
      .returning(["user_id", "email", "hash"])
      .then((data) => {
        console.log(data);
      });
  });
};

const getUserByEmail = (email) => {
  pg.select("*")
    .from("users")
    .where("email", email)
    .then((user) => {
      console.log(user);
      return user;
    });
};

const getUserByID = (id, res, db) => {
  console.log('dbLib.getUserByID - id:', id);
  db.select("*")
    .from("users")
    .where({id})
    .then((user) => {
      res.json(user);
    })
  // .catch((err) => {
  //   console.log("dbLib.getUserByID - err:", err);
  //   res.status(400).json("Error getting user");
  // });
}

const getAll = (table) => {
  // this.getAll = function (table) {
  pg.select("*")
    .from(table)
    .then((rows) => {
      console.log(rows);
      return rows;
    });
};

module.exports = {
  insertUser: insertUser,
  getUserByEmail: getUserByEmail,
  getUserByID: getUserByID,
  getAll: getAll
};

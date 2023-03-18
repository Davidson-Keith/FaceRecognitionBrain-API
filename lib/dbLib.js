const knex = require("knex");

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

function dbLib() {
  this.insertUser = (name, email) => {
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

  this.getUserByEmail = (email) => {
    pg.select("*")
      .from("users")
      .where("email", email)
      .then((user) => {
        console.log(user);
        return user;
      });
  };

  this.getAll = (table) => {
    // this.getAll = function (table) {
    pg.select("*")
      .from(table)
      .then((rows) => {
        console.log(rows);
        return rows;
      });
  };

  this.insertInitialUserData = () => {
    insertUser("jack", "j");
    insertUser("sam", "s@s.com");
  };
}

module.exports = dbLib;
// export { insertUser, getUserByEmail, getAll, insertInitialUserData };

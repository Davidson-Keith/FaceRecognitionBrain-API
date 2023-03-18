// 309. /signin and /register

// '/' - GET: log full db contents
// '/signin' - POST: (post to hide password via https). success/fail
// '/register' - POST: create user
// '/profile/:userid' - GET: get user
// '/updateEntriesCount' - PUT: update user entries count

const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
const { response } = require("express");

const saltRounds = 10; // for bcrypt

const app = express();
const port = 3000;

// app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

// -------------------
// DB
// -------------------

// attempt to move DB code to a dbLib
//
// const dbLib = require("./lib/dbLib");
// const db = new dbLib();
// db.insertInitialUserData();
// console.log(db.getAll("users"));
// console.log(db.getAll("logins"));
// const printUsers = () => {
//   db.getAll("users")
//     .then((users) => {
//       console.log(users);
//     })
//     .catch((err) => {
//       console.log("error:", error);
//     });
// };

// connection setup - doesn't work without setting up the env variable?
// const postgres = knex({
//   client: "pg",
//   connection: process.env.PG_CONNECTION_STRING,
//   searchPath: ["knex", "public"],
// });

// alternate explicit connection setup
const db = knex({
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

const insertInitialUserData = () => {
  insertUser("jack", "j");
  insertUser("sam", "s@s.com");
};

// works, but can't get caller to be able to use returned user, thus can't send it in the post response???
const insertUser = (name, email, password) => {
  let user = {
    id: null,
    name: name,
    email: email,
    entries: null,
    password: password,
    hash: null,
    created_when: null,
  };

  db.insert([
    {
      name: name,
      email: email,
    },
  ])
    .into("users")
    .returning(["*"])
    .then((data) => {
      console.log("insert user data:", data);
      user.id = data[0].id;
      user.entries = data[0].entries;
      user.created_when = data[0].created_when;
      console.log("user so far:", user);
    });
  bcrypt.hash(password, saltRounds, (err, hash) => {
    const id = db.select("id").from("users").where("email", email);
    // console.log("id:", id); // spits out all kinds of details, but is inserted correctly?!
    db.insert({
      user_id: id,
      email: email,
      hash: hash,
    })
      .into("logins")
      .returning(["user_id", "email", "hash"])
      .then((data) => {
        console.log("insert login data:", data);
        user.hash = data[0].hash;
        console.log("inserted user:", user);
        return user;
      });
  });
};

const getByEmail = (table, email) => {
  db.select("*")
    .from(table)
    .where("email", email)
    .returning("*")
    .then((response) => {
      console.log("getByEmail table:", table, ", response:", response);
      return response;
    });
};

const getAll = (table) => {
  // this.getAll = function (table) {
  db.select("*")
    .from(table)
    .then((rows) => {
      console.log(rows);
      return rows;
    });
};

// -------------------
// Test DB
// -------------------

// const rows = getUserByEmail("j");
// console.log("rows:", rows); // undefined???

// -------------------
// API
// -------------------

// '/' - GET: log full db contents
app.get("/", (req, res) => {
  res.send(db);
});

// '/signin' - POST: (post to hide password via https). success/fail
app.post("/signin", (req, res) => {
  console.log("app.post('/signin', (req, res) =>{...");
  const { email, password } = req.body;
  console.log("req.body.email:", email);
  console.log("req.body.password:", password);

  db.select("email", "hash")
    .from("logins")
    .where({ email })
    .then((data) => {
      console.log("data:", data);
      if (data.length) {
        // email exists
        bcrypt.compare(password, data[0].hash, (err, result) => {
          if (err) {
            console.log("/signin bcrypt.compare err:", err);
            res.status(400).json("User sign in failed. 1"); // are we ever here?
          }
          if (result) {
            console.log("hash result:", result);
            return db
              .select("*")
              .from("users")
              .where({ email })
              .then((data) => {
                console.log("/signin - login success:", data[0]);
                res.json(data[0]);
              });
          } else {
            console.log("Signin failed. hash result:", result);
            res.status(400).json("User sign in failed. 2"); // Existing email, wrong password
          }
        });
      } else {
        res.status(400).json("User sign in failed. 3"); // Non existent email.
      }
    });
});

// const user = db.getUserByEmail(req.body.email);
// getByEmail("users", email).then((user) => {
//   getByEmail("logins", email).then((login) => {
//     bcrypt.compare(password, login123.hash, (err, result) => {
//       if (err) {
//         console.log("bcrypt.compare err:", err);
//         return res.json({
//           success: false,
//           message: "error",
//         });
//       }
//       if (result) {
//         console.log("user signin ok - response.user:", user);
//         return res.json(user);
//       } else {
//         console.log(
//           "user signin failed - passwords don't match or user not found"
//         );
//         // res.status(401).json("error logging in");
//         // return res.status(401).json("passwords don't match or user not found");
//         return res.json({
//           success: false,
//           message: "passwords don't match or user not found",
//         });
//       }
//     });
//   });
// });

// bcrypt.compare(req.body.password, login123.hash, (err, result) => {
//   // console.log("bcrypt.compare - err:", err); // always undefined!? But can't remove err from parameters, or result is always undefined!
//   console.log("bcrypt.compare - result:", result); // true if hash compare passed, false if hash compare failed.
//   // if (err) {
//   //   res.status(400).json("error logging in"); // never gets here, err is always undefined
//   // }
//   if (result && req.body.email === user123.email) {
//     console.log("user signin ok - response.user123:", user123);
//     res.json(user123);
//   } else {
//     // console.log("user signin failed. Expected user:", user123);
//     console.log("user signin failed. Expected email:", user123.email);
//     res.status(401).json("error logging in");
//   }
// });
// });

// '/register' - POST: create user
app.post("/register", (req, res) => {
  console.log("app.post('/register', (req, res) =>{...");
  const { name, email, password } = req.body;
  console.log("req.body.name:", name);
  console.log("req.body.email:", email);
  console.log("req.body.password:", password);

  let user = {
    id: null,
    name: name,
    email: email,
    entries: null,
    hash: null,
    created_when: null,
  };

  // const hash = bcrypt.hashSync(password, saltRounds);
  bcrypt.hash(password, saltRounds, (err, hash) => {
    return db
      .transaction((trx) => {
        trx
          .insert([
            {
              name: name,
              email: email,
            },
          ])
          .into("users")
          .returning(["*"])
          .then((data) => {
            // console.log("insert user data:", data);
            user.id = data[0].id;
            user.entries = data[0].entries;
            user.created_when = data[0].created_when;
            // console.log("user so far:", user);
            return trx
              .insert({
                user_id: user.id,
                email: email,
                hash: hash,
              })
              .into("logins")
              .returning(["user_id", "email", "hash"])
              .then((data) => {
                // console.log("insert login data:", data);
                user.hash = data[0].hash;
                console.log("res: inserted user:", user);
                res.json(user);
              });
          })
          .then(() => {
            console.log("trx commit");
            trx.commit();
          })
          .catch((err) => {
            // doesn't seem to get here...
            console.log("trx rollback. err:", err);
            trx.rollback();
            res.status(400).json("unable to register");
          });
      })
      .catch((err) => {
        // doesn't seem to get here...
        console.log("trx err:", err);
        res.status(400).json("unable to register");
      });
  });
});

// '/profile/:id' - GET: get user
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        // console.log(user);
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => {
      console.log("app.get - /profile/:id - err:", err);
      res.status(400).json("Error getting user");
    });
});

// '/updateEntriesCount' - PUT: update user entries count
app.put("/updateEntriesCount", (req, res) => {
  const { id } = req.body;
  db("users")
    .where({ id })
    .increment({ entries: 1 })
    .returning("*")
    .then((user) => {
      if (user.length) {
        console.log(user[0]);
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => {
      console.log("app.put - /updateEntriesCount - err:", err);
      res.status(400).json("unable to set entries");
    });
});

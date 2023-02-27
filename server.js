// 309. /signin and /register

// '/' - GET: this is working
// '/signin' - POST: (post to hide password via https). success/fail
// '/register' - POST: create user
// '/profile/:userid' - GET: get user
// '/updateEntriesCount' - PUT: update user entries count

const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const saltRounds = 10;

const app = express();
const port = 3000;

// app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

// -------------------
// set up dummy dev db
// -------------------

const db = {
  users: [
    {
      id: 123,
      name: "jack",
      email: "j",
      // password: "j",
      entries: 0,
      joined: new Date(),
    },
    {
      id: 124,
      name: "sam",
      email: "s@s.com",
      // password: "sam",
      entries: 0,
      joined: new Date(),
    },
  ],
  login: [
    // { id: 123, hash: hash123, email: "j@j.com" },
    // { id: 124, hash: hash124, email: "s@s.com" },
  ],
};
bcrypt.hash("j", saltRounds, (err, hash) => {
  db.login.push({
    id: 123,
    hash: hash,
    email: "j",
  });
});
bcrypt.hash("sam", saltRounds, (err, hash) => {
  db.login.push({
    id: 124,
    hash: hash,
    email: "s@s.com",
  });
});

const getUser = (id) => {
  let returnUser;
  db.users.forEach((user) => {
    if (user.id === id) {
      returnUser = user;
    }
  });
  return returnUser;
}

const getLogin = (id) => {
  let returnLogin;
  db.login.forEach(login => {
    if (login.id === id) {
      returnLogin = login;
    }
  });
  return returnLogin;
}


// ---
// API
// ---

// '/' - GET: log full db contents
app.get("/", (req, res) => {
  res.send(db);
});

// '/signin' - POST: (post to hide password via https). success/fail
app.post("/signin", (req, res) => {
  console.log("app.post('/signin', (req, res) =>{...");
  console.log("req.body.email:", req.body.email);
  console.log("req.body.password:", req.body.password);
  // const hash = db.login[0].hash;
  // const user = db.users[0];
  const user123 = getUser(123);
  const login123 = getLogin(123);
  // console.log("getUser(123):", user123);
  // console.log("getLogin(123):", login123);
  bcrypt.compare(req.body.password, login123.hash, (err, result) => {
    // console.log("bcrypt.compare - err:", err); // always undefined!? But can't remove err from parameters, or result is always undefined!
    console.log("bcrypt.compare - result:", result); // true if hash compare passed, false if hash compare failed.
    // if (err) {
    //   res.status(400).json("error logging in"); // never gets here, err is always undefined
    // }
    if (result && req.body.email === user123.email) {
      console.log("user signin ok - response.user123:", user123);
      res.json(user123);
    } else {
      // console.log("user signin failed. Expected user:", user123);
      console.log("user signin failed. Expected email:", user123.email);
      res.status(401).json("error logging in");
    }
  });
});

// '/register' - POST: create user
app.post("/register", (req, res) => {
  console.log("app.post('/register', (req, res) =>{...");
  const { name, email, password } = req.body;
  console.log("req.body.name:", name);
  console.log("req.body.email:", email);
  console.log("req.body.password:", password);
  const user = {
    id: 125,
    name: name,
    email: email,
    entries: 0,
    joined: new Date(),
  };
  db.users.push(user);
  // db.users.push({
  //   id: 125,
  //   name: name,
  //   email: email,
  //   entries: 0,
  //   joined: new Date(),
  // });
  bcrypt.hash(password, saltRounds, (err, hash) => {
    db.login.push({
      id: 125,
      hash: hash,
      email: email,
    });
  });
  console.log('response - user:', user);
  res.json(user);
});

// '/profile/:id' - GET: get user
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let userFound = false;
  db.users.forEach((user) => {
    if (user.id == id) {
      userFound = true;
      return res.json(user);
    }
  });
  if (!userFound) {
    res.status(401).json("No such user");
  }
});

// '/updateEntriesCount' - PUT: update user entries count
app.put("/updateEntriesCount", (req, res) => {
  const { id } = req.body;
  let userFound = false;
  db.users.forEach((user) => {
    if (user.id == id) {
      userFound = true;
      user.entries++;
      return res.json(user);
    }
  });
  if (!userFound) {
    res.status(404).json("No such user");
  }
});

// -------------------
// '/register' - POST: create user
// -------------------
const handleRegister = (req, res, db, bcrypt, saltRounds) => {
  console.log("register.handleRegister = (req, res, db, bcrypt, saltRounds)")
  const {name, email, password} = req.body;
  console.log("req.body.name:", name);
  console.log("req.body.email:", email);
  console.log("req.body.password:", password);
  if (!email || !name || !password) {
    console.log('Register failed - incorrect form submission.');
    return res.status(400).json({
      success: false,
      status: "Incorrect form submission.",
    });
  }

  let user = {
    id: null,
    name: name,
    email: email,
    entries: null,
    hash: null,
    created_when: null,
  };

  // const hash = bcrypt.hashSync(password, saltRounds);
  bcrypt.hash(password, saltRounds, (error, hash) => {
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
                res.status(201).json(user);
              });
          })
          .then(() => {
            console.log("trx commit");
            trx.commit();
          })
          .catch((error) => {
            // Something weird has to happen to get here...
            console.log("trx rollback. error:", error);
            trx.rollback();
            return res.status(400).json({
              success: false,
              status: "Unable to register",
              err: error,
            });
          });
      })
      .catch((error) => {
        // Something weird has to happen to get here...
        console.log("trx error:", error);
        return res.status(400).json({
          success: false,
          status: "Unable to register",
          err: error,
        });
      });
  });
};

module.exports = {
  handleRegister
}
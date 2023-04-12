// -------------------
// '/signin' - POST: (post to hide password via https). success/fail
// -------------------
// NB: The following two options do the exact same thing (requiring a different function signature for calling
// signIn.handleSignIn(...)
// A function with 3 parameters, calling a function with 2 parameters??? Confusing.
// const handleSignIn = (db, bcrypt, saltRounds) => (req, res) => {
// Or, a function with 5 parameters. I find this version far easier to read and understand.
const handleSignIn = (req, res, db, bcrypt) => {
  console.log("signIn.handleSignIn = (req, res, db, bcrypt)")
  const {email, password} = req.body;
  console.log("req.body.email:", email);
  console.log("req.body.password:", password);
  if (!email || !password) {
    console.log('Sign in failed - incorrect form submission.');
    return res.status(400).json('incorrect form submission.');
  }

  db.select("email", "hash")
    .from("logins")
    .where({email})
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
              .where({email})
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
}

module.exports = {
  handleSignIn
}

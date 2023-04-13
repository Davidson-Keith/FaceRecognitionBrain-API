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
        bcrypt.compare(password, data[0].hash, (error, result) => {
          if (error) {
            console.log("/signin bcrypt.compare err:", error);
            return res.status(401).json({
              success: false,
              status: "Login Unsuccessful. 1",
              err: error,
            }); // are we ever here?
          }
          if (result) {
            console.log("hash result:", result);
            return db
              .select("*")
              .from("users")
              .where({email})
              .then((data) => {
                console.log("/signin - login successful:", data[0]);
                return res.json(data[0]);
              });
          } else {
            console.log("Signin failed. hash result:", result);
            return res.status(401).json({
              success: false,
              status: "Login Unsuccessful. 2",
              err: error,
            }); // Existing email, wrong password. Should be no error, just empty result from bcrypt.compare???
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          status: "Login Unsuccessful. 3",
        }); // Non-existent email. NB: there is no "error", just empty data from the SQL select.
      }
    });
}

module.exports = {
  handleSignIn
}

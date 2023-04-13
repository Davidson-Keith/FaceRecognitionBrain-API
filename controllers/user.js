// -------------------
// '/user/:id' - GET: get user - Dev only, would normally remove for production.
// -------------------
const handleGetUser = (req, res, db) => {
  console.log("user.handleGetUser = (req, res, db)")
  const {id} = req.params;
  db.select("*")
    .from("users")
    .where({id})
    .then((user) => {
      if (user.length) {
        // console.log(user);
        return res.json(user[0]);
      } else {
        return res.status(400).json({
          success: false,
          status: "User not found",
        });
      }
    })
    .catch((error) => {
      console.log("app.get - /profile/:id - error:", error);
      return res.status(400).json({
        success: false,
        status: "Error getting user",
      });
    });
}

module.exports = {
  handleGetUser
}
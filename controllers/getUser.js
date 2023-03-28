// '/profile/:id' - GET: get user
//
// NB: for dev only. Remove for production.
const handleGetUser = (req, res, db) => {
  const {id} = req.params;
  db.select("*")
    .from("users")
    .where({id})
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
}

module.exports = {
  handleGetUser: handleGetUser
}
// '/updateEntriesCount' - PUT: update user entries count
const handleUpdateEntriesCount = (req, res, db) => {
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
}

module.exports = {
  handleUpdateEntriesCount: handleUpdateEntriesCount
}
// -------------------
// '/image' - PUT: update user entries count
// -------------------

// const clarifai = require('clarifai');
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

// required by gRPC API
const API_KEY = process.env.API_KEY_CLARIFAI;
const MODEL_ID = "face-detection";

/*
samples:
https://purneauniversity.org/wp-content/uploads/2022/12/JC-.png
https://www.oscars.org/sites/oscars/files/02_loren9.jpg
https://media.vanityfair.com/photos/615478afc1d17015c14bd905/master/pass/no-time-to-die-film-still-01.jpg
https://samples.clarifai.com/metro-north.jpg
*/

const handleImageURLgRPC = (req, res) => {
  console.log("image.handleImageURLgRPC(req, res)");
  const {url} = req.body;
  console.log("req.body.url:", url);

  const stub = ClarifaiStub.grpc();
  const metadata = new grpc.Metadata();
  metadata.set("authorization", "Key " + API_KEY);

  stub.PostModelOutputs(
    {
      // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
      model_id: MODEL_ID,
      inputs: [{data: {image: {url: url}}}]
    },
    metadata,
    (err, response) => {
      if (err) {
        console.log("Error: " + err);
        res.status(400).json("Unable to process image" + err);
        return;
      }
      if (response.status.code !== 10000) {
        console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
        res.status(400).json("Unable to process image: " + response.status.description + "\n" + response.status.details);
        return;
      }
      console.log('response:', response);
      res.send(response);
    }
  );
}

const handleUpdateEntriesCount = (req, res, db) => {
  console.log("image.handleUpdateEntriesCount(req, res, db)");
  const {id} = req.body;
  db("users")
    .where({id})
    .increment({entries: 1})
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
      res.status(400).json("Unable to set entries: " + err);
    });
}

module.exports = {
  handleUpdateEntriesCount,
  handleImageURLgRPC
}
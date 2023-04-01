// -------------------
// '/image' - PUT: update user entries count
// -------------------

// const clarifai = require('clarifai');

const USER_ID = "chengis";
// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = "b6489c5155df49bc9ed8f81eb64d532d";
const APP_ID = "facebrain";
const MODEL_ID = "face-detection";
// const Model = Clarifai.FACE_DETECT_MODEL; // This is NOT the Model ID???
// console.log("Model: ", Model);
// const MODEL_VERSION_ID = "45fb9a671625463fa646c3523a3087d5";
// const IMAGE_URL = "https://samples.clarifai.com/metro-north.jpg";
// const IMAGE_URL = this.state.imageInput;

const handleUpdateEntriesCount = (req, res, db) => {
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
      res.status(400).json("unable to set entries");
    });
}


// samples:
// https://purneauniversity.org/wp-content/uploads/2022/12/JC-.png
// https://www.oscars.org/sites/oscars/files/02_loren9.jpg
// https://media.vanityfair.com/photos/615478afc1d17015c14bd905/master/pass/no-time-to-die-film-still-01.jpg
// https://samples.clarifai.com/metro-north.jpg

const handleImageURL = (req, res) => {
  console.log("handleImageURL(req, res) =>{...");
  const {url} = req.body;
  console.log("req.body.url:", url);

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: url,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };

  // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
  // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
  // this will default to the latest version_id
  fetch(
    "https://api.clarifai.com/v2/models/" +
    MODEL_ID +
    // "/versions/" +
    // MODEL_VERSION_ID +
    "/outputs",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => res.send(result))
    .catch((error) => {
      console.log("handleImageURL - unable to process image:", error)
      res.status(400).json("unable to process image");
    });
}


module.exports = {
  handleUpdateEntriesCount,
  handleImageURL
}
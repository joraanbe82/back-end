/* Blog pictures route */
var express = require("express");
var router = express.Router();
let mongo = require("mongodb");
const multer = require("multer");
const path = require("path");

/* Address to save files uploaded whith multer */
var avatarStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  }
});

/* To get info database blog picture*/
router.get("/:id?", (request, response) => {
  const id = request.params.id;
  if (id) {
    global.dbo
      .collection("blogPicture")
      .find(
        {
          _id: new mongo.ObjectID(id)
        },
        {
          projection: {
            _id: 0,
            description: 1,
            link: 1,
            img: 1
          }
        }
      )
      .toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          response.send(result);
        }
      });
  }
  global.dbo
    .collection("blogPicture")
    .find(
      {},
      {
        projection: {
          description: 1,
          link: 1,
          img: 1
        }
      }
    )
    .toArray(function(err, result) {
      if (err) {
        throw err;
      } else {
        response.send(result);
      }
    });
});

/* To create a new blog picture, include img with multer */
router.post(
  "/",
  multer({
    storage: avatarStorage
  }).single("file"),
  (request, response) => {
    if (
      request.body.description === "" ||
      request.file.filename === ""
    ) {
      response.status(400).send();
    } else {
      let myobj = {
        description: request.body.description,
        img: request.file.filename,
        link: request.body.link
      };
      global.dbo.collection("blogPicture").insertOne(myobj, function(err, res) {
        if (err) throw err;
        response.send(res.ops[0]);
      });
    }
  }
);

/* To delete a blog picture */
router.delete("/:id", (request, response) => {
  const id = request.params.id;
  const myquery = {
    _id: new mongo.ObjectID(id)
  };
  global.dbo.collection("blogPicture").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    response.send();
    console.log("1 document deleted");
  });
});

/* To update a blog picture */
router.put(
  "/:id",
  multer({
    storage: avatarStorage
  }).single("file"),
  (request, response) => {
    const id = request.params.id;
    const myquery = {
      _id: new mongo.ObjectID(id)
    };

    const obj = {};

    if (request.body.description !== "") {
      obj.description = request.body.description;
    }
    if (request.body.link !== "") {
      obj.link = request.body.link;
    }

    const newvalues = {
      $set: obj
    };

    global.dbo.collection("blogPicture").updateOne(myquery, newvalues);
    global.dbo
      .collection("blogPicture")
      .find(myquery)
      .toArray()
      .then(documents => {
        response.status(200).send(documents[0]);
      });
  }
);

module.exports = router;

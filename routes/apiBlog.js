/* Blog route */
var express = require("express");
var router = express.Router();
let mongo = require("mongodb");
const multer = require("multer");
const path = require("path");

/* Address to save files uploaded whith multer */
var avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  }
});

/* To get info database blog */
router.get("/:id?", (request, response) => {
  const id = request.params.id;
  if (id) {
    global.dbo
      .collection("blog")
      .find({
        _id: new mongo.ObjectID(id)
      }, {
        projection: {
          _id: 0,
          title: 1,
          subtitle: 1,
          secondSubtitle: 1,
          description: 1,
          img: 1
        }
      })
      .toArray(function (err, result) {
        if (err) {
          throw err;
        } else {
          response.send(result);
        }
      });
  }
  global.dbo
    .collection("blog")
    .find({}, {
      projection: {
        title: 1,
        subtitle: 1,
        secondSubtitle: 1,
        description: 1,
        img: 1
      }
    })
    .toArray(function (err, result) {
      if (err) {
        throw err;
      } else {
        response.send(result);
      }
    });
});

/* To create a new blog, include img with multer */
router.post(
  "/",
  multer({
    storage: avatarStorage
  }).single("file"),
  (request, response) => {
    if (
      request.body.title === "" ||
      request.body.subtitle === "" ||
      request.body.secondSubtitle === "" ||
      request.body.description === ""

    ) {
      response.status(400).send();
    } else {
      let myobj = {
        title: request.body.title,
        subtitle: request.body.subtitle,
        secondSubtitle: request.body.secondSubtitle,
        description: request.body.description,
        img: request.file.filename
      };
      global.dbo.collection("blog").insertOne(myobj, function (err, res) {
        if (err) throw err;
        response.send(res.ops[0]);
      });
    }
  }
);

/* To delete a blog */
router.delete("/:id", (request, response) => {
  const id = request.params.id;
  const myquery = {
    _id: new mongo.ObjectID(id)
  };
  global.dbo.collection("blog").deleteOne(myquery, function (err, obj) {
    if (err) throw err;
    response.send();
    console.log("1 document deleted");
  });
});

/* To update a blog */
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

    if (request.body.title !== "") {
      obj.title = request.body.title;
    }
    if (request.body.subtitle !== "") {
      obj.subtitle = request.body.subtitle;
    }

    if (request.body.secondSubtitle !== "") {
      obj.secondSubtitle = request.body.secondSubtitle;
    }
    if (request.body.description !== "") {
      obj.description = request.body.description;
    }
    if(request.file.filename !== "") {
      obj.img = request.file.filename;
    }

    const newvalues = {
      $set: obj
    };

    global.dbo.collection("blog").updateOne(myquery, newvalues);
    global.dbo
      .collection("blog")
      .find(myquery)
      .toArray()
      .then(documents => {
        response.status(200).send(documents[0]);
      });
  }
);

module.exports = router;
/*Main Route */
let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let mongo = require("mongodb");
let md5 = require("md5");
let nodemailer = require("nodemailer");
const ig = require("instagram-node").instagram();

/* Route to verify token */
router.post("/auth", (request, response) => {
  const query = global.dbo.collection("talentUsers").find({
    email: request.body.e,
    pass: md5(request.body.p)
  });

  query.toArray().then(documents => {
    if (documents.length > 0) {
      var token = jwt.sign(
        {
          email: documents[0].email,
          isAdmin: documents[0].isAdmin ? true : false,
          id: documents[0]._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 3600
        }
      );
      response.send(token);
    } else {
      response.status(400).send("Invalid credentials");
    }
  });
});

/* To get info database. With the values 0 we exclude the 
field and with 1 we include it */
router.get("/users/:id?", (request, response) => {
  const id = request.params.id;
  console.log("mi id: " + id);
  if (id) {
    global.dbo
      .collection("talentUsers")
      .find(
        {
          _id: new mongo.ObjectID(id)
        },
        {
          projection: {
            _id: 0,
            first_name: 1,
            last_name: 1,
            email: 1,
            validate: 1
          }
        }
      )
      .toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          response.send(result[0]);
        }
      });
  } else {
    global.dbo
      .collection("talentUsers")
      .find(
        {},
        {
          projection: {
            first_name: 1,
            last_name: 1,
            email: 1,
            validate: 1,
            date: 1
          }
        }
      )
      .sort({
        date: -1
      })
      .toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          response.send(result);
        }
      });
  }
});

/* Create new talent user */
router.post("/users", async (request, response) => {
  if (
    request.body.first_name === "" ||
    request.body.last_name === "" ||
    request.body.email === ""
  ) {
    response.status(400).send();
  } else {
    let myobj = {
      first_name: request.body.first_name,
      last_name: request.body.last_name,
      email: request.body.email,
      isAdmin: request.body.isAdmin,
      pass: md5(request.body.pass),
      validate: request.body.validate,
      date: new Date()
    };
    global.dbo
      .collection("talentUsers")

      .findOne({ email: request.body.email }, (err, result) => {
        if (!result) {
          global.dbo
            .collection("talentUsers")
            .insertOne(myobj, function(err, res) {
              if (err) throw err;
              global.dbo
                .collection("Admin")
                .find(
                  {
                    isAdmin: true
                  },
                  {
                    projection: {
                      email: 1,
                      emailPass: 1
                    }
                  }
                )
                .toArray(function(err, result) {
                  if (err) {
                    throw err;
                  } else {
                    response
                      .status(201)
                      .send(res.ops[0]); /* res.ops[0] show the new document*/
                    let transporter = nodemailer.createTransport({
                      /* Library to send a email registration */
                      service: process.env.MAIL_SERVICE,
                      host: process.env.MAIL_HOST_SERVICE,
                      secure: false,
                      port: 25,
                      auth: {
                        user: process.env.MAIL_USER,
                        /* Who send the email, its saved in database*/
                        pass: process.env.MAIL_PASS
                      },
                      tls: {
                        rejectUnauthorized: false
                      }
                    });
                    let message = {
                      from: process.env.MAIL_MESSAGE_FROM,
                      to: [request.body.email, process.env.MAIL_MESSAGE_FROM],
                      subject: "Welcome to LevelUP",
                      text: "Thank you for join at team LevelUp",

                      html: `<!DOCTYPE html>
                    <html lang="en">
                    
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>Correo de confirmación</title>
                        <!--  Bootstrap -->
                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                            integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                        <!--  Bootstrap -->
                    </head>
                    
                    <body>
                        <div class="container">
                            <h4><strong>Hello ${res.ops[0].first_name}</strong></h4>
                            <p><strong>Please confirm your e-mail address by clicking on the following link:</strong></p>
                            <p><a href="https://front-levelup.herokuapp.com/verify/${res.ops[0]._id}">Verificationlink </a> <-- Click</p>
                                                                        
                            <p>This gives us the permission to send you e-mails with further information about LevelUP 
                            (e.g. job ads, blogposts, events etc.).</p>
                            <br/>
                            <p>Many thanks and warm greetings,</p>                            
                            <p>Marcel and Sandra</p>                  
                    
                            <p>PS: Every e-mail that you receive from us in the future, on the basis of your consent, contains a link at the end that allows you to delete your e-mail address immediately and securely with a simple click.</p>
                            <div style="text-align:center">
                                <p><strong>This is how you can reach us:</strong></p>
                                <p>via phone Mo-Fr 09:00 - 18:00: +49 173 9644 018</p>
                                <p>via e-mail: info@network-levelup.com</p>
                                <p><strong>Follow us </strong><a href="https://www.facebook.com/network.levelup/">Facebook</a> // <a
                                        href="https://www.instagram.com/network.levelup/">Instagram</a> // <a
                                        href="https://www.linkedin.com/company/network-levelup">LinkedIn</a> // <a
                                        href="https://www.youtube.com/channel/UC02i1gSEb4gAyBQ-ki6GcHQ/featured">YouTube</a> </p>
                            </div>
                    
                            <div style="text-align:center">
                                <p><strong>Imprint:</strong></p>
                                <p>LevelUP</p>
                                <p>Sandra Thomas & Marcel Rödiger GbR</p>
                                <p>Apenrader Straße 37</p>
                                <p>30165 Hannover</p>
                                <p>Germany</p>
                            </div>
                    
                    
                        </div>
                    
                    
                    </body>
                    
                    </html>`,
                      attachments: [
                        {
                          filename: "PrivacyPolicyEN.pdf",
                          path:
                            "https://front-levelup.herokuapp.com/PrivacyPolicyEN.pdf"
                        }
                      ]
                    };
                    transporter.sendMail(message, (error, info) => {
                      if (error) {
                        return console.log(
                          "No se ha mandado el email " + error
                        );
                      }
                    });
                  }
                });
            });
        } else {
          response.status(400).send("Email is already registered");
        }
      });
  }
});

/* Update talent users */
router.put("/users/:id", (request, response) => {
  const id = request.params.id;
  const myquery = {
    _id: new mongo.ObjectID(id)
  };

  const obj = {};

  if (request.body.first_name !== "") {
    obj.first_name = request.body.first_name;
  }
  if (request.body.last_name !== "") {
    obj.last_name = request.body.last_name;
  }
  if (request.body.email !== "") {
    obj.email = request.body.email;
  }
  if (request.body.pass !== "") {
    obj.pass = md5(request.body.pass);
  }

  const newvalues = {
    $set: obj
  };

  global.dbo.collection("talentUsers").updateOne(myquery, newvalues);
  global.dbo
    .collection("talentUsers")
    .find(myquery)
    .toArray()
    .then(documents => {
      response.status(200).send(documents[0]);
    });
});

/* To get the validation account for talents */
router.get("/users/:id/validate", (request, response) => {
  const id = request.params.id;  
  global.dbo.collection("talentUsers").updateOne(
    {
      _id: new mongo.ObjectID(id)
    },
    {
      $set: {
        validate: true
      }
    }
  )
  // response.send();
  global.dbo
      .collection("talentUsers")
      .find(
        {
          _id: new mongo.ObjectID(id)
        },
        {
          projection: {
            _id: 1,
            first_name: 1,
            email: 1,
          }
        }
      )
      .toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          response.send(result[0]);
        }
        // console.log("result: " + JSON.stringify(result[0]));
        let transporter = nodemailer.createTransport({
          /* Library to send a email registration */
          service: process.env.MAIL_SERVICE,
          host: process.env.MAIL_HOST_SERVICE,
          secure: false,
          port: 25,
          auth: {
            user: process.env.MAIL_USER,
            /* Who send the email, its saved in database*/
            pass: process.env.MAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        let message = {
          from: process.env.MAIL_MESSAGE_FROM,
          to: [result[0].email, process.env.MAIL_MESSAGE_FROM],
          subject: "LevelUP – Next instructions",
               
          html: `<!DOCTYPE html>
                          <html lang="en">                          
                          <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <meta http-equiv="X-UA-Compatible" content="ie=edge">
                              <title>Correo de confirmación</title>
                              <!--  Bootstrap -->
                              <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                  integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                              <!--  Bootstrap -->
                          </head>                          
                          <body>
                              <div class="container">
                                  <h4>Hello ${result[0].first_name}</h4>
                                  <p>with the registration you should go the next steps to get your personal job offer from Germany!</p>

                                  <div style="text-align:center">
                                      <p><strong>Follow simple three instructions:</strong></p>
                                      <p>1. Fill out our attached CV</p>
                                      <p>2. Feel free to add additional certificates or references</p>
                                      <p>3. Send us your filled out CV draft (as an open document) back to: info@network-levelup.com</p>
                                      <p>4. We are going to contact you for an online meeting to get to know each other</p>
                                  </div>                                                                          
                                  
                                  <p>With these information we have the chance to contact our network of German employers and look
                                   for vacancies which are fitting to your expectations and experiences.</p>
                                  <br/>
                                  <p>Let’s stay in contact here or via LinkedIn: </p>                         
                                  <p><a href="https://www.linkedin.com/in/sandra-thomas-704856137/">Sandra Thomas</a></p>
                                  <p><a href="https://www.linkedin.com/in/marcel-r%C3%B6diger-8b3178166/">Marcel Rödiger</a></p>
                                  <p>We will keep you updated how the process is going on.</p>
                                  <p>Best regards</p>
                                  <p>Marcel and Sandra</p>
                                  <div style="text-align:center">
                                      <p><strong>This is how you can reach us:</strong></p>
                                      <p>via phone Mo-Fr 09:00 - 18:00: +49 173 9644 018</p>
                                      <p>via e-mail: info@network-levelup.com</p>
                                      <p><strong>Follow us </strong><a href="https://www.facebook.com/network.levelup/">Facebook</a> // 
                                        <a href="https://www.instagram.com/network.levelup/">Instagram</a> // 
                                        <a href="https://www.linkedin.com/company/network-levelup">LinkedIn</a> // 
                                        <a href="https://www.youtube.com/channel/UC02i1gSEb4gAyBQ-ki6GcHQ/featured">YouTube</a> </p>
                                  </div>
                          
                                  <div style="text-align:center">
                                      <p><strong>Imprint:</strong></p>
                                      <p>LevelUP</p>
                                      <p>Sandra Thomas & Marcel Rödiger GbR</p>
                                      <p>Apenrader Straße 37</p>
                                      <p>30165 Hannover</p>
                                      <p>Germany</p>
                                  </div>  
                                  <p>If you don't want to receive further E-Mails please press: </p>                                  
                                  <p><a href="https://front-levelup.herokuapp.com/unsubscribe/${result[0]._id}">Unsubscribe</a></p>                  
                              </div>               
                          </body>                    
                          </html>`,
          attachments: [
            {
              filename: "DRAFT_CV.docx",
              path: "https://front-levelup.herokuapp.com/DRAFT_CV.docx"
            }
          ]
        };
        transporter.sendMail(message, (error, info) => {
          if (error) {
            return console.log("No se ha mandado el email " + error);
          }
        });
      });
      });
  

      
/* To unsubscribe account for talents */
router.get("/users/:id/unsubscribe", (request, response) => {
  const id = request.params.id;  
  global.dbo.collection("talentUsers").updateOne(
    {
      _id: new mongo.ObjectID(id)
    },
    {
      $set: {
        validate: false
      }
    }
  )
  response.send();
  });
/* Delete talent users */
router.delete("/users/:id", (request, response) => {
  const id = request.params.id;
  const myquery = {
    _id: new mongo.ObjectID(id)
  };
  global.dbo.collection("talentUsers").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    response.send();
    console.log("1 document deleted");
  });
});

/* To get the data info in instagram */
router.get("/instagram", function(req, res) {
  ig.user_self_media_recent(function(
    err,
    medias,
    pagination,
    remaining,
    limit
  ) {
    // render the home page and pass in the popular images
    res.send(medias);
  });
});
// configure instagram app with your access_token
ig.use({
  access_token: process.env.IGACCESS_TOKEN
});

router.post("/talents/profile/:id", (request, response) => {
  const talentId = request.params.id;

  const obj = {
    talentId: talentId,
    worksAreas: request.body.worksAreas,
    levelExperience: request.body.levelExp,
    locations: request.body.locations,
    spanishSkills: request.body.spanishSkills,
    englishSkills: request.body.englishSkills,
    germanSkills: request.body.germanSkills,
    futherLanguageSkills: request.body.futherLanguageSkills,
    furtherLanguage: request.body.furtherLanguage
  };

  global.dbo.collection("talentProfile").insertOne(obj, function(err, res) {
    if (err) {
      throw err;
    } else {
      response.status(201).send(res.ops[0]);
    }
  });
});

module.exports = router;

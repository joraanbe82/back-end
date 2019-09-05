/* Companies route */
let express = require("express");
let router = express.Router();
let md5 = require("md5");
let nodemailer = require("nodemailer");
let mongo = require("mongodb");

/* To get the validation account for companies */
router.get("/companies/:id/validate", (request, response) => {
  const id = request.params.id;
  global.dbo.collection("companies").updateOne(
    {
      _id: new mongo.ObjectID(id)
    },
    {
      $set: {
        validate: true
      }
    }
  );
  response.send();
});

/* To get info database of comapnies */
router.get("/companies/:id?", (request, response) => {
  const id = request.params.id;
  if (id) {
    global.dbo
      .collection("companies")
      .find(
        {
          _id: new mongo.ObjectID(id)
        },
        {
          projection: {
            _id: 0,
            first_CompanyName: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            validate: 1
          }
        }
      )
      .sort({
        first_name: 1
      })
      .toArray(function(err, result) {
        if (err) {
          throw err;
        } else {
          response.send(result[0]);
        }
      });
  } else {
    global.dbo
      .collection("companies")
      .find(
        {},
        {
          projection: {
            first_CompanyName: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            validate: 1
          }
        }
      )
      .sort({
        first_name: 1
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

/* Create new company user */
router.post("/", async (request, response) => {
  if (
    (request.body.first_CompanyName === "") |
      (request.body.first_name === "") ||
    request.body.last_name === "" ||
    request.body.email === "" ||
    request.body.pass === ""
  ) {
    response.status(400).send();
  } else {
    let myobj = {
      first_CompanyName: request.body.first_CompanyName,
      first_name: request.body.first_name,
      last_name: request.body.last_name,
      email: request.body.email,
      isAdmin: request.body.isAdmin,
      pass: md5(request.body.pass),
      validate: request.body.validate
    };
    global.dbo
      .collection("companies")
      .findOne({ email: request.body.email }, (err, result) => {
        if (!result) {
          global.dbo
            .collection("companies")
            .insertOne(myobj, function(err, res) {
              if (err) throw err;
              global.dbo
                .collection("users")
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
                      service: "hotmail",
                      secure: false,
                      port: 25,
                      auth: {
                        user: result[0].email,
                        /* Who send the email, its saved in database*/
                        pass: result[0].emailPass
                      },
                      tls: {
                        rejectUnauthorized: false
                      }
                    });
                    let message = {
                      from: "levelupPrueba@hotmail.com",
                      to: request.body.email,
                      subject: "Willkommen bei LevelUP!",
                      text: "Thank you for join at team LevelUp",
                      html: `<!DOCTYPE html>
              <html lang="en">
              
              <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <meta http-equiv="X-UA-Compatible" content="ie=edge">
                      <title>Confirmation Email</title>
                      <!--  Bootstrap -->
                      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                              integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
                              crossorigin="anonymous">
                      <!--  Bootstrap -->
              </head>
              
              <body>
                      <div class="container">
                              <h1>Willkommen bei LevelUP!</h1>
                              <p><strong>Bitte bestätige deine E-Mail-Adresse mit dem Klick auf den folgenden Link:
                                      </strong></p>
                              
                              <p><a href="http://localhost:3000/verify/companies/${res.ops[0]._id}">Click</a></p>
                              <p>Damit erteilst du uns die Erlaubnis, dass wir dir E-Mails mit weiteren Informationen zu LevelUP
                                      schicken dürfen (z.B. Stellenanzeigen, Blogeinträge, etc.).</p>
                              <p><u>Das Wichtigste zuerst:
                                      </u></p>
                              <p><strong>IN PROGRESS: </strong>Finde mit unserem Test heraus, ob remote-Zusammenarbeit überhaupt etwas
                                      für dich ist:
                                      Dein Downloadlink für den Gratis-Personality-Test</p>
                              <p>Wie es danach weitergeht…</p>
                              <p>Wenn im Ergebnis remote-Zusammenarbeit zu deinen persönlichen Vorlieben passt, dann melden wir uns
                                      bei dir, um noch vor der fertigen Plattform ein Profil von dir zu erstellen und deine Wünsche
                                      bzgl. eines Arbeitgebers aufzunehmen.
                              </p>
                              <p>Dieses Profil bringen wir in unseren persönlichen Gesprächen mit über 1.000 deutschen Arbeitgebern
                                      ein und bauen für dich einen Erstkontakt auf. Bei Interesse kommt es auf diesem Wege zu euren
                                      ersten Video-Interviews und wenn du dich gut anstellst zu deinem Traumjob als Angestellte von
                                      Spanien aus für eine deutsche Firma zu arbeiten.
              
                              </p>
              
                              <p>PS: Jede E-Mail, die du aufgrund deines Einverständnisses zukünftig von uns erhältst, enthält am Ende einen Link, mittels dessen du deine E-Mail-Adresse durch einen einfachen Klick umgehend sicher löschen kannst.
                                      </p>
                              <div style="text-align:center">
                                      <p><strong>So erreichst du uns:
                                              </strong></p>
                                      <p>Phone Mon-Fri 9-18 Uhr: +49 173 9644018</p>
                                      <p>per E-mail: info@network-levelup.com</p>
                                      <p><strong>Folge uns auch auf </strong><a href="https://www.facebook.com/network.levelup/">Facebook</a> // <a
                                              href="https://www.instagram.com/network.levelup/">Instagram</a> // <a
                                              href="https://www.linkedin.com/company/network-levelup">LinkedIn</a> // <a
                                              href="https://www.youtube.com/channel/UCdz_BfUo5LlKvh13s0wenhg">YouTube</a> </p>
                              </div>
                                             
                              <div style="text-align:center">
                                      <p><strong>Impressum:
                                              </strong></p>
                                      <p><strong>LevelUP</strong></p>
                                      <p>Sandra Thomas & Marcel Rödiger GbR</p>
                                      <p>Graf-Zeppelin-Strasse 32</p>
                                      <p>31157 Sarstedt, Germany</p>
                                      <p>Datenschutzerklärung
                                      </p>
                              </div>
              
                      </div>
              
              
              </body>
              
              </html>`
                    };
                    transporter.sendMail(message, (error, info) => {
                      if (error) {
                        return console.log("no se ha mandado el mail" + error);
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

/* Delete company users */
router.delete("/company/:id", (request, response) => {
  const id = request.params.id;
  const myquery = {
    _id: new mongo.ObjectID(id)
  };
  global.dbo.collection("companies").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    response.send();
    console.log("1 document deleted");
  });
});

module.exports = router;

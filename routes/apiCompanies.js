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
      validate: request.body.validate,
      date: new Date()
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
                              <h1>Hallo Herr / Frau ${res.ops[0].last_name}</h1>
                              <h2><strong>Willkommen bei LevelUP!</strong></h2>
                              <p><strong>Bitte bestätigen Sie Ihre E-Mail-Adresse mit dem Klick auf den folgenden Link:
                                      </strong></p>
                              
                              <p><a href="https://www.network-levelup.com/verify/companies/${res.ops[0]._id}">Verifizierungslink</a><-- Click</p>
                              <p>Damit erteilen Sie uns die Erlaubnis, dass wir Ihnen E-Mails mit weiteren Informationen zu LevelUP schicken dürfen (z.B. erste Fachkräfte-Profile, Blogeinträge, etc.).</p>
                                                         
                              <p>Wie geht es jetzt weiter…</p>
                              <p>Mit Einwilligung in unsere E-Mail Serie werden wir uns mit einem Vorschlag zu einem Telefontermin bei Ihnen melden. Gerne möchten wir Ihnen erläutern, wie wir Ihre Vakanzen in Zukunft gemeinsam effizient und einfach in kürzester Zeit mit geeigneten Fachkräften aus Spanien besetzen.
                              </p>
                              <p>Sind Sie offen für Neues?</p>
                              <p>Dann gehen Sie mit uns den nächsten Schritt in Sachen New Work und internationaler Zusammenarbeit.</p>
                              <br/>
                              <p><strong>Vielen Dank und herzliche Grüße,</strong></p>
                              <p><strong>Marcel Rödiger und Sandra Thomas</strong></p>
                              <p>PS: Jede E-Mail, die Sie aufgrund Ihres Einverständnisses zukünftig von uns erhalten, enthält am Ende einen Link, mittels dessen Sie Ihre E-Mail-Adresse durch einen einfachen Klick umgehend sicher löschen können.</p>
                              <div style="text-align:center">
                                      <p><strong>So erreichen Sie uns:
                                              </strong></p>
                                      <p>Telefon Mo-Fr 9-18 Uhr: +49 173 9644 018</p>
                                      <p>E-Mail: info@network-levelup.com </p>
                                      <p><strong>Follow us on </strong><a href="https://www.facebook.com/network.levelup/">Facebook</a> // <a
                                              href="https://www.instagram.com/network.levelup/">Instagram</a> // <a
                                              href="https://www.linkedin.com/company/network-levelup">LinkedIn</a> // <a
                                              href="https://www.youtube.com/channel/UC02i1gSEb4gAyBQ-ki6GcHQ/featured">YouTube</a> </p>
                              </div>
                                             
                              <div style="text-align:center">
                                      <p><strong>Impressum:
                                              </strong></p>
                                      <p><strong>LevelUP</strong></p>
                                      <p>Sandra Thomas & Marcel Rödiger GbR</p>
                                      <p>Apenrader Straße 37</p>
                                      <p>30165 Hannover</p>
                                      <p>Germany</p>
                                      <p>Datenschutzerklärung</p>
                              </div>
                              <p>Sie möchten keine weiteren E-Mails mehr erhalten?</p>                             
                              <p><a href="https://www.network-levelUP.com/unsubscribe/${result[0]._id}">Unsubscribe</a></p>
                      </div>
              
              
              </body>
              
              </html>`,
              attachments: [{
                filename: 'PrivacyPolicyDE.pdf'  ,
                path: 'https://front-levelup.herokuapp.com/PrivacyPolicyDE.pdf'
              }]
                    };
                    transporter.sendMail(message, (error, info) => {
                      if (error) {
                        return console.log("no se ha mandado el email" + error);
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

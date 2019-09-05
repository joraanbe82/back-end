/*Main Route */
let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let mongo = require("mongodb");
let md5 = require("md5");
let nodemailer = require("nodemailer");
const ig = require("instagram-node").instagram();

const secret = "mysecret";

/* Route to verify token */
router.post("/auth", (request, response) => {
  const query = global.dbo.collection("users").find({
    first_name: request.body.u,
    pass: md5(request.body.p)
  });

  query.toArray().then(documents => {
    if (documents.length > 0) {
      var token = jwt.sign(
        {
          first_name: documents[0].first_name,
          isAdmin: documents[0].isAdmin ? true : false,
          id: documents[0]._id
        },
        secret,
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
            validate: 1
          }
        }
      )
      .sort({
        first_name: 1,
        
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
      validate: request.body.validate
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
                      /* Library to send a email registration */
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
                      subject: "Welcome to Level UP",
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
                            <h1>Bienvenido a LevelUP!</h1>
                            <p><strong>Por favor, confirme su dirección de correo electrónico haciendo clic en el siguiente enlace:</strong></p>
                            <p><a href="http://localhost:3000/verify/${res.ops[0]._id}">Confirmar email</a></p>
                                                                        
                            <p>Esto nos da permiso para enviarle correos electrónicos con más información sobre LevelUP
                                    ,por ejemplo: anuncios de empleo, blogs, etc.</p>
                            <p><u>Lo más importante lo primero:</u></p>
                            <p><strong>PROXIMAMENTE: </strong>Usa nuestro test para saber si el trabajo en remoto se adapta a sus necesidades:
                                (Su enlace de descarga para el test de personalidad gratuito)</p>
                            <p>Cómo continuar después...</p>
                            <p>Si el resultado del test de trabajo en remoto coincide con sus preferencias personales, nos pondremos en contacto con usted para
                                    crear un perfil de sus habilidades y sus deseos con respecto a un contratador, antes de que la plataforma esté terminada.
                                    Utilizaremos este perfil en nuestras conversaciones personales con más de 1.000 empresas alemanas y estableceremos el primer contacto con las empresas interesadas.
                                    Si el interes es mutuo, obtendrás tus primeras entrevistas a través de videollamadas y si lo haces
                                    bien, conseguirás el trabajo de tus sueños como trabajador en  España, para poder trabajar con una empresa alemana.
                                    Muchas gracias y saludos cordiales,
                                    Sandra y Marcel.</p>
                    
                            <p>PD: Cada correo electrónico que reciba de nosotros en el futuro bajo su consentimiento contendrá un enlace para darse de 
                                baja en nuestra base de datos y dejar de recibir este tipo de correos con ofertas de trabajo, con un simple click.</p>
                            <div style="text-align:center">
                                <p><strong>Así es como puede contactar con nosotros:</strong></p>
                                <p>Teléfono Lunes a Viernes de 9:00 - 18:00 horas: +49 173 9644018</p>
                                <p>Por e-mail: info@network-levelup.com</p>
                                <p><strong>Siguenos en </strong><a href="https://www.facebook.com/network.levelup/">Facebook</a> // <a
                                        href="https://www.instagram.com/network.levelup/">Instagram</a> // <a
                                        href="https://www.linkedin.com/company/network-levelup">LinkedIn</a> // <a
                                        href="https://www.youtube.com/channel/UCdz_BfUo5LlKvh13s0wenhg">YouTube</a> </p>
                            </div>
                    
                            <div style="text-align:center">
                                <p><strong>Pie de imprenta</strong></p>
                                <p>LevelUP</p>
                                <p>Sandra Thomas & Marcel Rödiger GbR</p>
                                <p>Graf-Zeppelin-Strasse 32</p>
                                <p>31157 Sarstedt, Germany</p>
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
  );
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
  access_token: "12026791675.1e7b180.cbe49b2273344fa7b98fa80c1d3a1205"
});

module.exports = router;

var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("./config/mongoDB"); // INICIAR MONGO

let apiRouter = require("./routes/api");
let apiBlog = require("./routes/apiBlog");
let apiBlogPicture = require("./routes/apiBlogPicture");
let apiCompanies = require("./routes/apiCompanies");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);
app.use("/apiBlog", apiBlog);
app.use("/apiBlogPicture", apiBlogPicture);
app.use("/apiCompanies", apiCompanies);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
});

module.exports = app;

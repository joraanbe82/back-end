const express = require("express");
const router = express.Router();
const request = require("request");

const options = {
  method: "GET",
  url: `https://network-levelup.eu.auth0.com/api/v2/users/${process.env.AUTH0_CLIENT_ID}`,
  headers: {
    authorization: `Bearer ${process.env.AUTH0_LINKEDIN_TOKEN}`
  }
};

request(options, function(error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});


module.exports = router;

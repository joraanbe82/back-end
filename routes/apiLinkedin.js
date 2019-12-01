// Register the strategy
const express = require("express");
const router = express.Router();
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;


const linkedinConfig = {
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK,
  scope: ['r_emailaddress', 'r_liteprofile'],
  state: true
}
const strategy = new LinkedInStrategy(
  linkedinConfig,
  (accessToken, refreshToken, profile, done) => {
    const linkedinId = profile._json.id
    const nameFirst = profile._json.firstName
    const nameLast = profile._json.lastName
    const email = profile._json.emailAddress
    const linkedinToken = accessToken // we need to store this
     try {
      User.findOrCreate({
        where: {linkedinId},
        defaults: {
          nameFirst,
          nameLast,
          email,
          linkedinToken,

        }
      })
    } catch (err) {
      done(err)
    }
  }
)
// Tell passport to use the above strategy
passport.use(strategy)

// logout

router.get('/auth/linkedin/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// and then authenticate as:

router.get('/auth/linkedin', 
  passport.authenticate('linkedin', (err, user, info) => {
  if (err) {
    return next(err)
  }
}), async (req, res, next) => {
  // The request will be redirected to LinkedIn for authentication, so this
  // function will not be called.
  console.log('/auth/linkedin',req)
  res.redirect('/')
  next()
});


router.get('/auth/linkedin/callback', 
  passport.authenticate('linkedin', {
    successRedirect: '/auth/linkedin/redirect',
    failureRedirect: '/auth/linkedin'
  }), async (req, res, next) => {
      // console.log(req.user.dataValues)
      res.send(req.user.dataValues)
}); 

// Redirect the user back to the app

router.get('/auth/linkedin/redirect', async (req, res, next) => {
// you can see what you get back from LinkedIn here:
console.log(req.user.dataValues) 
res.redirect("https://localhost:3000/")
});


router.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });
  
// the login callback:

router.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

module.exports = router;
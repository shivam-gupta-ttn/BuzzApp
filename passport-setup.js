const passport = require("passport")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require("dotenv");
const User = require("./models/user")

dotenv.config();


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5500/auth/google/buzz"
  },
   async function(accessToken, refreshToken, profile, done) {
    if (await User.exists({ googleId: profile.id })) {
      await User.findOne({ googleId: profile.id }, function (err, user) {
          console.log("found===>>", profile)
          console.log("json===>",profile._json)
          console.log(err)
          return done(err, profile);
      });
  } else {
      await User.create({ 
        googleId: profile.id,
        email: profile._json.email,
        fname:profile._json.name,
        profilePicture:profile._json.picture
       }, function (err, user) {
          console.log("created====>", profile)
          return done(err, profile);
      })
  }
  }
));
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});
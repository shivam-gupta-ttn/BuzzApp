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
    async function (accessToken, refreshToken, profile, done) {
        console.log(profile)
        if (profile._json.hd === "tothenew.com") {
            if (await User.exists({ googleId: profile.id })) {
                await User.findOne({ googleId: profile.id }, function (err, user) {
                    console.log(err)
                    return done(err, user);
                });
            } else {
                User.create({
                    googleId: profile.id,
                    email: profile._json.email,
                    name: profile._json.name,
                    profilePicture: profile._json.picture,
                    friendRequests: [{ incoming: [] }, { outgoing: [] }],
                    username: profile.displayName,
                }, function (err, user) {
                    return done(err, user);
                })
            }
        }else{
            done(new Error("Only tothenew.com"))
        }
    }
));
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
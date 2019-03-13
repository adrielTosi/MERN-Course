const JtwStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')
const User = mongoose.model('users')
const key = require('../config/keys').secretOrKey

const opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken()
opts.secretOrKey = key

module.exports = passport => {
  passport.use(new JtwStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      }).catch(err => console.log(err))
  }))
}
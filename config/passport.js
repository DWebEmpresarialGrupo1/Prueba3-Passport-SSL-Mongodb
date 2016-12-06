'use strict'

const path = require('path');
const LocalStrategy = require('passport-local').Strategy;

const User = require(path.join(__dirname, '..', 'app', 'models', 'user'));

module.exports = function(passport) {
  // Usado para serializar el usuario para la sesion
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // Usado para deserializar el usuario
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup',
    new LocalStrategy({
      // by default, local strategy uses username and password, we will
      // override with email
      usernameField: 'email',
      passwordField: 'password',
      // allows us to pass back the entire request to the callback
      passReqToCallback: true
    },
    function(req, email, password, done) {
      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email':  email }, function(err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null,
              false,
              // req.flash is the way to set flashdata using connect-flash
              req.flash('signupMessage', 'Este email ya fue tomado'));
          } else {
            // if there is no user with that email
            // create the user
            let newUser = new User();

            // set the user's local credentials
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            // save the user
            newUser.save(function(err) {
              if (err)
                  throw err;
              return done(null, newUser);
            });
          }
        });
      });
    })
  );

  passport.use('local-login',
    new LocalStrategy({
      // by default, local strategy uses username and password, we will
      // override with email
      usernameField: 'email',
      passwordField: 'password',
      // allows us to pass back the entire request to the callback
      passReqToCallback: true
    },
    // callback with email and password from our form
    function(req, email, password, done) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null,
            false,
            // req.flash is the way to set flashdata using connect-flash
            req.flash('loginMessage', 'Usuario no encontrado'));

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
          return done(null,
            false,
            // create the loginMessage and save it to session as flashdata
            req.flash('loginMessage', 'Password equivocado'));

        // all is well, return successful user
        return done(null, user);
      });
    })
  );
};

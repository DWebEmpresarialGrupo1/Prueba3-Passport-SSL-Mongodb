'use strict'

module.exports = function(app, passport) {
  // Render the login page.
  app.get('/login', function(req, res, next) {
    res.render('login', {
      title: 'Autenticacion con Node.js',
      message: req.flash('loginMessage'),
      csrfToken: req.csrfToken()
    });
  });
  app.get('', function(req, res) {
    console.log('console.log')
    console.log(req);
    console.log(req.body);

  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  // Process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // Render the signup page.
  app.get('/signup', function(req, res, next) {
    res.render('signup', {
      title: 'Autenticacion con Node.js',
      message: req.flash('signupMessage'),
      csrfToken: req.csrfToken()
    });
  });

  // Process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // logout
  app.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
  });
};

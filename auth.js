function setupAuth(User, app) {
  
  var passport = require('passport');
  var GoogleStrategy = require('passport-google-oauth20').Strategy;

  // var FacebookStrategy = require('passport-facebook').Strategy;

  // High level serialize/de-serialize configuration for passport

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.
      findOne({ _id : id }).
      exec(done);
  });

  //Google Specific

  passport.use(new GoogleStrategy({
    clientID: '297828468814-b2hs25j4gkv6fk4dg6o86qknnrcgcrgv.apps.googleusercontent.com',
    clientSecret: 'S8Ubrggv-sSsVDRtFT-S5L_i',
    callbackURL: "https://mymeanstackapplication.herokuapp.com/auth/google/callback?redirect=%2F%23%2F"
  },
  function(accessToken, refreshToken, profile, done) {

    // if (!profile.emails || !profile.emails.length) {
    //   return done('No emails associated with this account!');
    // }

    console.log('profile',profile);
    User.findOneAndUpdate({ 'data.oauth': profile.id },
        {
          $set: {
            'profile.username': profile.displayName,
            'profile.picture': profile.photos[0].value
          }
        },
        { 'new': true, upsert: true, runValidators: true }, function (err, user) {
      return done(err, user);
    });
  }
));

  // Facebook-specific

  /*

  passport.use(new FacebookStrategy(
    {
      clientID: '229655060826139',
      clientSecret: '0c424c572097e22b9d715c8d507a643e',
      callbackURL: 'https://mymeanstackapplication.herokuapp.com/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {

      User.findOneAndUpdate(
        { 'data.oauth': profile.id },
        {
          $set: {
            'profile.username': profile.displayName,
            'profile.picture': 'http://graph.facebook.com/' +
              profile.id.toString() + '/picture?type=large'
          }
        },
        { 'new': true, upsert: true, runValidators: true },
        function(error, user) {
          done(error, user);
        });
    }));

  */

  // Express middlewares

  app.use(require('express-session')({
    secret: 'this is a secret'
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Express routes for auth


  // app.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));

  // app.get('/auth/google/callback', 
  //   passport.authenticate('google', { failureRedirect: '/login' }),
  //   function(req, res) {
  //     res.redirect('/');
  //   });



    app.get('/auth/google',
    function(req, res, next) {
      var redirect = encodeURIComponent('/#/');
      console.log(redirect);

      passport.authenticate('google',
        {
          scope: ['profile'],
          callbackURL: 'https://mymeanstackapplication.herokuapp.com/auth/google/callback?redirect=' + redirect
        })(req, res, next);
    });


  app.get('/auth/google/callback',
    function(req, res, next) {
      var url = 'https://mymeanstackapplication.herokuapp.com/auth/google/callback?redirect=' +encodeURIComponent(req.query.redirect);
      // var url = 'http://localhost:5000/auth/google/callback';
      passport.authenticate('google', { callbackURL: url })(req, res, next);
    },
    function(req, res) {
      res.redirect(req.query.redirect);
    });
}

module.exports = setupAuth;

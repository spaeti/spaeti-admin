/**
 * Module dependencies.
 */

var express = require('express'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  crypto = require('crypto'),
  routes = require('./routes'),
  spaeti = require('./routes/spaeti'),
  config = require('./config.json'),
  http = require('http'),
  path = require('path');

var app = express();

mongoose.connect("mongodb://" + config.mongo_user + ":" + config.mongo_pw + "@localhost:" + config.mongo_port + "/" + config.mongo_db);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  permissions: {
    manageUsers: Boolean,
    addSpaeti: Boolean,
    editSpaeti: Boolean
  },
  methods: {

  }
});

userSchema.methods.validPassword = function (password) {
  return crypto.createHash('sha256').update(password).digest('base64') === this.password;
};

var User = mongoose.model('User', userSchema);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
/*
        user = new User({
          username : username,
          password : crypto.createHash('sha256').update(password).digest('base64'),
          permissions : {
            manageUsers : true,
            addSpaeti : true,
            editSpaeti : true
          }
        });
        user.save();
        return done(null, user);
*/
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'schnittei' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  if (!req.user &&
    req.originalUrl.indexOf('/login') === -1) {
    res.redirect('admin/johann/login');
  } else {
    next();
  }
});
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/login', routes.login);
app.post('/login',
  passport.authenticate('local', {
    successRedirect: 'admin/johann/',
    failureRedirect: 'admin/johann/login'
    //failureFlash : 'Ungültiger Nutzername oder falsches Passwort!'
  }));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('admin/johann/login');
});

app.get('/list', spaeti.list);
app.get('/add', spaeti.add);
app.get('/details', spaeti.details);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

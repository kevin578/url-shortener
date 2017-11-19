
//basic setup
const express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var validUrl = require('valid-url');
var app = express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shortenURL', {
  useMongoClient: true
});

mongoose.Promise = global.Promise;


//body parsing for forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//Create schema and model to link to
var Schema = mongoose.Schema;

var shortURL = new Schema({
  newURL: String,
  originalURL: String
});

var Link = mongoose.model('links', shortURL);

//route for main page
app.get('/', function(req, res) {
  res.render('home');
});

//Post route for when form is submitted
app.post("/shortenURL", (req, res) => {

//New instance of Link schema with information from form
  myData = new Link({
    originalURL: req.body.urlInput,
    newURL: req.body.newURL
  });


//Checks if shortened URL already exists in the database. If if doesn't, it saves it to the DB.
  Link.findOne({ newURL:req.body.newURL }).then((link) => {

    if (!validUrl.isUri(req.body.urlInput)){
      return res.render('home', {
        invalidLink: req.body.urlInput
      })
    }

    if(!link) {
    myData.save()
      .then(item => {
        res.render('home', {
          oldLink: req.body.urlInput,
          newLink: req.body.newURL
        });
      })
      .catch(err => {
        res.status(400).send("unable to save to database");
      });
    } else {
      res.render('home', {
        usedLink: req.body.newURL
      })
    }

  })


});

//Retrieves website from the database based on Querystring. Then redirects to the webpage.
app.get('/:id', (req, res) => {
  var id = req.params.id;

  Link.findOne({newURL:id}).then((link) => {
    if (!link) {
      return res.status(404).send();
    }
    res.redirect(link.originalURL);
  }).catch((e) => {
    res.status(400).send();
  });
});


//sets up handlebars
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));


//Sets port and listens for call

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});

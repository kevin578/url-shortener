const express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



var app = express();

mongoose.connect('mongodb://localhost:27017/shortenURL', {
  useMongoClient: true
});

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Define schema
var Schema = mongoose.Schema;

var shortURL = new Schema({
  newURL: String,
  originalURL: String
});

// Compile model from schema
var Link = mongoose.model('links', shortURL);




app.post("/shortenURL", (req, res) => {


  myData = new Link({
    originalURL: req.body.urlInput,
    newURL: req.body.newURL
  });

  Link.findOne({ newURL:req.body.newURL }).then((link) => {
    if(!link) {
    myData.save()
      .then(item => {
        res.send("item saved to database");
      })
      .catch(err => {
        res.status(400).send("unable to save to database");
      });
    } else {
      res.send("URL already exists. Please choose another one.")
    }

  })


});

app.get('/urls', (req, res) => {
  Link.find().then((links) => {
    res.send({links});
  }, (e) => {
    res.status(400).send(e);
  });
});

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


app.set('port', process.env.PORT || 3000);
app.get('/', function(req, res) {
  res.render('home');
});


app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});

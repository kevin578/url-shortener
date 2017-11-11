const express = require('express');
var mongoose = require('mongoose');




var app = express();

mongoose.connect('mongodb://localhost:27017/shortenURL', { useMongoClient: true });
mongoose.Promise = global.Promise;


var urlSchema = new mongoose.Schema({
  url: String
});

var User = mongoose.model("User", urlSchema);

app.post("/shortenURL", (req, res) => {
  var myData = new User(req.body);
  console.log(req.body);

  myData.save()
  .then(item => {
  res.send("item saved to database");
  })
  .catch(err => {
  res.status(400).send("unable to save to database");
  });
});



var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
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


app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});

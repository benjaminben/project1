var express = require('express'),
    config = require('./server/config')
    mongodb = require('./server/mongo_client'),
    app = express(),
    controller = require('./server/controller.js');
    http = require('http');
    bp = require('body-parser')

app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static('public'));
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

var server = app.listen(app.get('port'), function() {
  console.log('running on' + app.get('port'));

  mongodb.connect(config.mongodPath || 'mongodb://localhost:27017/keef_sris', function() {
    console.log('Connected to MongoDB.');
  });

});
server.timeout = 1000;

app.get('/', function(req, res){
  res.json({health: 'a ok'})
});
app.get('/scores', function(req, res){
  controller.scores(req, res)
});
app.post('/scores', function(req, res){
  controller.addScore(req, res)
})

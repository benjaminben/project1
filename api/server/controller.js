var path = require('path');
var client = require('./mongo_client');

module.exports = {
  index: function(req, res) {
    res.sendFile(path.join(__dirname + '/../views/index.html'));
  },
  scores: function(req, res) {
    client
      .db()
      .collection('scores')
      .find()
      .sort({ score: -1 })
      .limit(10)
      .toArray(function(err, scores){
        if( err ){ throw err; }
        res.send( {scores: scores} );
      });
  },
  addScore: function(req, res) {
    var score = {name: req.body.name, score: req.body.score}
    client
      .db()
      .collection('scores')
      .insert(
        score,
        function(err){
          if( err ){
            console.log(err);
          }
          else{
            console.log('score posted:', score)
            res.sendStatus(200)
          }
        }
      );
  }
}

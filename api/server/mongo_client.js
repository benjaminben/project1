(function(){
  var client = require('mongodb').MongoClient,
      mongodb,
      db;

      module.exports = {
        connect: function(dburl, callback) {
          client.connect(dburl,
            function(err, client){
              db = client.db('sris');
              if(callback) { callback(); }
            });
         },
        db: function() {
          return db;
        },
        close: function() {
          mongodb.close();
        }
      };
})();

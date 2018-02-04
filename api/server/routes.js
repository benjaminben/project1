var controller = require('./controller');

modile.exports.initialize = function(app, router) {
  router.get('/', controller.index);
  router.get('/sris/scores', controller.scores);
}

module.exports = function(app) {
  var express = require('express');
  var todosRouter = express.Router();
  todosRouter.get('/', function(req, res) {
    res.send({"todos":[
      {
         id: 1,
         title: 'Learn Ember.js',
         is_completed: true
       },
       {
         id: 2,
         title: '...',
         is_completed: false
       },
       {
         id: 3,
         title: 'Profit!',
         is_completed: false
       }
    ]});
  });
  app.use('/api/todos', todosRouter);
};

import DS from 'ember-data';

var Todo = DS.Model.extend({
  title: DS.attr('string'),
  is_completed: DS.attr('boolean')
});

Todo.reopenClass({
  FIXTURES: [
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
  ]
});

export default Todo;
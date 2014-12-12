import Ember from 'ember';

export default Ember.ArrayController.extend({
  actions: {
    createTodo: function() {
      var title = this.get('new_title');

      // Bail out if there's nothing (or just whitespace) in the input field
      if (!title.trim()) return;

      // Create the model
      var todo = this.store.createRecord('todo', {
        title: title,
        is_completed: false
      });

      // Save the model
      todo.save();

      // Reset the input field
      this.set('new_title', '');
    },
    clearCompleted: function() {
      var completed = this.filterBy('is_completed', true);

      completed.invoke('deleteRecord');
      completed.invoke('save');
    }
  },
  all_are_completed: function(key, value) {
    if (value === undefined) { // Getter
      return !!this.get('length') && this.isEvery('is_completed');
    } else { // Setter
      this.setEach('is_completed', value);
      this.invoke('save');
      return value;
    }
  }.property('@each.is_completed'),
  completed: function() {
    return this.filterBy('is_completed', true).get('length');
  }.property('@each.is_completed'),
  has_completed: function() {
    return this.get('completed') > 0;
  }.property('completed'),
  remaining: function() {
    return this.filterBy('is_completed', false).get('length');
  }.property('@each.is_completed'),
  inflection: function() {
    return this.get('remaining') === 1 ? 'todo' : 'todos';
  }.property('remaining')
});

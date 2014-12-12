import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    editTodo: function() {
      this.set('is_editing', true);
    },
    acceptChanges: function() {
      this.set('is_editing', false);

      var model = this.get('model');

      if (Ember.isEmpty(model.get('title'))) {
        this.send('removeTodo');
      } else {
        model.save();
      }
    },
    removeTodo: function() {
      var model = this.get('model');
      model.deleteRecord();
      model.save();
    }
  },
  isEditing: false,
  is_completed: function(key, value) {
    var model = this.get('model');

    if (value === undefined) { // Getter
      return model.get('is_completed');
    } else { // Setter
      // Save the model
      model.set('is_completed', value);
      model.save();

      // Return the value so the UI stays up to date
      return value;
    }
  }.property('model.is_completed')
});

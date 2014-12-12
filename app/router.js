import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('todos', { path: '/' }, function() {
    // Need a nest to get 'index'
  });
});

export default Router;

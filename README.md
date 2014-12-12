<p class="lead">This post describes porting the Todo MVC application <a href="http://emberjs.com/guides/getting-started/planning-the-application/">described in the Ember guides</a> into Ember CLI. I've not gone into much detail around the Ember fundamentals -- the guides themselves will be infinitely more useful to you for that.</p>

## Collect the necessary tools

* Get latest version of [Node](http://www.nodejs.org)

Then, from the command line:

1. Install [Ember CLI](http://www.ember-cli.com): `npm install -g ember-cli`
1. Install [Bower](http://bower.io/): `npm install -g bower`
1. Install [PhantomJS](http://phantomjs.org/) (for integration tests, not covered here): `npm install -g phantomjs`

## Scaffold the application

From the command line, run `ember new todo_mvc`.

This will create a new todo_mvc directory containing the structure of the application. Inside this, you'll find the following files and folders:

* `app/`, containing the application code
* `dist/`, containing the optimised application output (which is what you'd ultimately deploy)
* `public/`, which will contain assets that don't require a build step
* `tests/`, which houses unit and integration tests
* `tmp/`, for temporary output of build steps
* `bower_components`, containing dependencies; both those included with Ember CLI, and those installed with Bower
* `vendor/`, which is for any external dependencies not installed with Bower or npm
* `.jshintrc`, a [JSHint](http://jshint.com/) configuration file
* `.gitignore`, which is for preventing stuff from being checked in to Git
* `Brocfile.js`, which contains build specifications for [Broccoli](https://github.com/broccolijs/broccoli)
* `bower.json`, which is used to manage dependencies
* `package.json`, which is for npm configuration

The exciting stuff is mostly contained within the `app` directory:

* `app/app.js` -- the module that's executed first.
* `app/index.html` -- the app's single page, which includes dependencies to start the app.
* `app/router.js` -- the router configuration, containing definitions corresponding to routes in `app/routes`
* `app/styles/` -- stylesheets that are compiles into app.css
* `app/templates/` -- [handlebars](http://handlebarsjs.com/) templates, which are compiled into `templates.js` (named the same as their filename, minus the `.hbs` extension)
* `app/models/` -- where your app's models are *defined*
* `app/controllers/` -- controllers for your app's models.

At this point, you can run `ember serve`, which will build your new app and serve it at http://0.0.0.0:4200/ where you should be able to see 'Welcome to Ember.js'. This text is coming from the application template file in `app/templates/application.hbs`; open that file and remove everything apart from the `{% raw %}{{outlet}}{% endraw %}` tag. We'll go on to create other templates, which will be rendered into this `{% raw %}{{outlet}}{% endraw %}` tag.

## Add the Todo MVC styles

Grab the Todo MVC CSS file from [here](http://emberjs.com.s3.amazonaws.com/getting-started/style.css) and paste it directly into `app/styles/app.css`, replacing anything that was there to begin with. Also, download [this background image](http://emberjs.com.s3.amazonaws.com/getting-started/bg.png) and save it in `public/assets/images`. Then update the path to the background image in `app.css`; change line 26 to read: `background: #eaeaea url('images/bg.png');`

## Create a static template

From the command line, inside the `todo_mvc` directory, run the command `ember generate template todos`.

This will create a template file: `app/templates/todos.hbs`.

Inside this file, add the following static markup:

{% highlight html %}

<section id="todoapp">
  <header id="header">
    <h1>todos</h1>
    <input type="text" id="new-todo" placeholder="What needs to be done?" />
  </header>

  <section id="main">
    <ul id="todo-list">
      <li class="completed">
        <input type="checkbox" class="toggle">
        <label>Learn Ember.js</label><button class="destroy"></button>
      </li>
      <li>
        <input type="checkbox" class="toggle">
        <label>...</label><button class="destroy"></button>
      </li>
      <li>
        <input type="checkbox" class="toggle">
        <label>Profit!</label><button class="destroy"></button>
      </li>
    </ul>

    <input type="checkbox" id="toggle-all">
  </section>

  <footer id="footer">
    <span id="todo-count">
      <strong>2</strong> todos left
    </span>
    <ul id="filters">
      <li>
        <a href="all" class="selected">All</a>
      </li>
      <li>
        <a href="active">Active</a>
      </li>
      <li>
        <a href="completed">Completed</a>
      </li>
    </ul>

    <button id="clear-completed">
      Clear completed (1)
    </button>
  </footer>
</section>

<footer id="info">
  <p>Double-click to edit a todo</p>
</footer>

{% endhighlight %}

## Add a route to surface the todos template

Inside `router.js`, in the `map` function, we'll point the root of our app to a todos resource, which will cause Ember to serve our todos template when we visit http://0.0.0.0:4200/

{% highlight JS %}

Router.map(function() {
  this.resource('todos', { path: '/' });
});

{% endhighlight %}

If we serve the app now, it should be looking good.

## Add a todo model

From the command line, run `ember generate model todo`, then add `title` and `is_completed` properties to the model file created in `app/models/todo.js`:

{% highlight JS %}

import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  is_completed: DS.attr('boolean')
});

{% endhighlight %}

## Add Fixture data

Ember CLI comes with an `http-mock` generator which is now the preferred (over e.g. fixtures) way to deal with dummy data in development and testing. I attempted to get it working with http mocks, and got quite a long way, but ended up suffering further down the line (not really having the chops to configure the express server). I'll outline what I tried in the 'Using HTTP mocks' section, but __if you're following along, you should skip this and go to the 'Using a fixture adapter' section instead__. Hopefully I'll return to this and get the HTTP mocks version working in future.

### Using HTTP mocks

To create a mock for the `todos` endpoint, run `ember generate http-mock todos`. This will add a `server` directory, containing a `todos.js` file at `server/mocks/todos.js`.

Add some mock data to the `todos` array:

{% highlight js %}

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

{% endhighlight %}

Then we have to customise the application REST adapter with the 'api' namepace. To do this, run `ember generate adapter application`, then add the `namespace` property to the file created at `app/adapters/application.js`:

{% highlight js %}

import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  namespace: 'api'
});

{% endhighlight %}

### Using a fixture adapter

Create an application adapter with the command `ember generate adapter application`. Then extend the `FixtureAdapter` in `app/adapters/application.js`:

{% highlight js %}

import DS from 'ember-data';

export default DS.FixtureAdapter.extend();

{% endhighlight %}

Now, we have to reopen the model class in `app/models/todo.js`, and add our fixture data:

{% highlight js %}

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

{% endhighlight %}

## Add a todos route

We need to extend the `todos` route, so that we can use it's `model` hook to get our data. Run `ember generate route todos`.

Because we've already generated a todos template, Ember CLI will ask whether to overwrite `todos.hbs` -- we want to keep what we already have, so hit 'n' and return.

Then in the newly created `app/routes/todos.js`, use the `model` hook to find all todos from the store:

{% highlight js %}

import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.find('todo');
  }
});

{% endhighlight %}

This will enable us to reference the todo model in our template.

## Replace static markup with model data

Back in `app/templates/todos.hbs`, we can now replace the static `<li>`s with dynamic data from our model.

Refactor the `<ul class="todo-list"></ul>` to look like this:

{% highlight html %}
{% raw %}
<ul id="todo-list">
  {{#each todo in model}}
  <li {{bind-attr class="todo.is_completed:completed"}}>
    <input type="checkbox" class="toggle">
    <label>{{todo.title}}</label><button class="destroy"></button>
  </li>
  {{/each}}
</ul>
{% endraw %}
{% endhighlight %}

## Create a new model

Now we can swap out the `<input type="text">` with the ember `{% raw %}{{input}}{% endraw %}` helper:

{% highlight html %}
{% raw %}
    {{input
      type="text"
      id="new-todo"
      placeholder="What needs to be done?"
      value=new_title
      action="createTodo"}}
{% endraw %}
{% endhighlight %}

Here, we've referenced an action, `createTodo`, which will be performed when a user presses return in the input field. Now we have to add that action to the todos controller.

Run `ember generate controller todos --type=array` -- if you don't specify the `type`, Ember CLI will generate a basic controller, which wouldn't be appropriate for the situation we're in -- dealing with multiple todos.

Then create an `actions` hash on the todos controller created at `app/controllers/todos.js`, and add the createTodo method to it:

{% highlight js %}

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
    }
  }
});

{% endhighlight %}

At this point, you'll get a JSHint warning about not having curlies on the one-line if-statement. This is easily rectified by changing `"curly": true` to `"curly": false` in the .jshintrc file at the root of the project.

If you serve the app, now, you should be able to enter new todos using the input field.

## Change a model's completed status

Update the `<input type="checkbox">` to be an Ember helper, with the `checked` attribute equal to the `is_completed` property of the model.

{% highlight html %}
{% raw %}
{{#each todo in model itemController="todo"}}
  <li {{bind-attr class="todo.is_completed:completed"}}>
    {{input
      type="checkbox"
      checked=todo.is_completed
      class="toggle"}}
    <label>{{todo.title}}</label><button class="destroy"></button>
  </li>
{{/each}}
{% endraw %}
{% endhighlight %}

So now, when this {% raw %}{{input}}{% endraw %} is rendered it will get the current value of the controller's is_completed property. When a user clicks this input, it will set the value of the controller's is_completed property to either true or false depending on the new checked value of the input.

In order to target the individual todos, rather than the whole array, we add an `itemController` to the `{% raw %}{{each}}{% endraw %}` block. This indicates which controller we want Ember to use on a per-todo basis. We say we want a `todo` `itemController`, so now we have to generate it: `ember generate controller todo --type=object`. And then we have to set up the ability to get and set the `is_completed` property:

{% highlight js %}

import Ember from 'ember';

export default Ember.ObjectController.extend({
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

{% endhighlight %}

When `is_completed` is called from the template, the todo controller will proxy the question to its underlying model, whereas if the property is being *set* (by toggling the todo's checkbox) the controller will update the underlying model and the UI, accordingly.

If you serve the app, now, you should be able to mark items as complete/incomplete by clicking their checkbox ticks.

## Update incomplete todos

Create a `remaining` property on the todos controller, to count the incomplete todos:

{% highlight js %}

remaining: function() {
  return this.filterBy('is_completed', false).get('length');
}.property('@each.is_completed')

{% endhighlight %}

This should be *outside* the `actions` hash created earlier.

Then output this computed property, instead of the hard-coded value, in the todos template:

{% highlight html %}
{% raw %}

<strong>{{remaining}}</strong> todos left

{% endraw %}
{% endhighlight %}

In order to pluralise 'todo' correctly, we'll add an `inflection` property that returns the string 'todos', unless there's only one todo remaining, in which case it returns 'todo':

{% highlight js %}

inflection: function() {
  return this.get('remaining') === 1 ? 'todo' : 'todos';
}.property('remaining')

{% endhighlight %}

And again, update the todos template:

{% highlight html %}
{% raw %}

<strong>{{remaining}}</strong> {{inflection}} left

{% endraw %}
{% endhighlight %}

If you serve the app and toggle some of the todos' completed status now, you should see the counter at the bottom-left updating appropriately (while remaining gramatically sound).

## Toggle between displaying and editing

Update the `todos.hbs` template to include some markup that conditionally renders one of two sections, based on whether or not an `is_editing` property is `true` on the todo's controller:

{% highlight html %}
{% raw %}

<ul id="todo-list">
  {{#each todo in model itemController="todo"}}
    {{#with todo}}
      <li {{bind-attr class="is_completed:completed is_editing:editing"}}>
        {{input
          type="checkbox"
          checked=is_completed
          class="toggle"}}
        {{#if is_editing}}
          <input class="edit" autofocus="autofocus" />
        {{else}}
          <label {{action "editTodo" on="doubleClick"}}>{{title}}</label>
          <button class="destroy"></button>
        {{/if}}
      </li>
    {{/with}}
  {{/each}}
</ul>

{% endraw %}
{% endhighlight %}

We've added an `editTodo` action to the label, which will get called when it is double-clicked.

We also reset context using the `{% raw %}{{with}}{% endraw %}` block helper -- this lets us use the `itemController` on each todo, individually.

Now we have to handle that action in the (individual) todo controller's `actions` hash:

{% highlight js %}

import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    editTodo: function() {
      this.set('is_editing', true);
    }
  },
  is_editing: false,
  // truncated

{% endhighlight %}

When a label is double-clicked, the `editTodo` action sets the `is_editing` property to `true`, which in turn adds an `editing` class to the `<li>`, as well as swapping out the `label` for an `input` field.

In the [Ember guides implementation of this step](http://emberjs.com/guides/getting-started/accepting-edits/), a custom view is registered with a handlebars helper, to demonstrate how to tap into when the element is added to the DOM so focus could be set on the input. Updates in how attributes are bound means this step is no longer necessary -- simply adding `autofocus="autofocus"` will suffice. Moreover, the Ember CLI guides state:

> A common pattern with helpers is to define a helper to use your views (e.g. for a custom text field view, `MyTextField` a helper `my-text-field` to use it). It is advised to leverage Components instead.

## Accept edits

Now we can set up an action on the todo controller, to call when a user either tabs out of the input field, or hits return in the input field.

First, swap out the `<input class="edit">` for an Ember input helper:

{% highlight html %}
{% raw %}

{{input
  class="edit"
  value=title
  focus-out="acceptChanges"
  insert-newline="acceptChanges"
  autofocus="autofocus"}}

{% endraw %}
{% endhighlight %}

Then add the `acceptChanges` action to the todo controller's `actions` hash:

{% highlight js %}

actions: {
  // truncated
  acceptChanges: function() {
    // Update the UI, first
    this.set('is_editing', false);

    var model = this.get('model');

    if (Ember.isEmpty(model.get('title'))) {
      // Delete item if it doesn't have a title
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
// truncated

{% endhighlight %}

In the `acceptChanges` action, we check if the title is empty; if so, we call another action, `removeTodo` -- using the `send` method -- to delete the todo.

## Enable deletion

In the previous step, we created the action `removeTodo`, which we called from the action `acceptChanges` if the input field was empty when the user tabbed of it or hit return. All we have to do to allow deletion from a button on the UI, is to add an action helper to the `<button class="destroy">`:

{% highlight html %}
{% raw %}
<button {{action "removeTodo"}} class="destroy"></button>
{% endraw %}
{% endhighlight %}

## Add child routes

Now we'll split our template into a set of nested templates, so that we can transition between different lists of todos.

Run `ember generate template todos/index`

Then move the entire `<ul id="todo-list">` inside the file created at `app/templates/todos/index.hbs`, and replace it with an `{% raw %}{{outlet}}{% endraw %}` in `app/templates/todos.hbs`, so that the `<section id="main">` looks like this:

    <section id="main">
      {% raw %}{{outlet}}{% endraw %}
      <input type="checkbox" id="toggle-all">
    </section>

In order for a resource to have an `index` route, it has to have a nested segment. To set this up, we have to update our router to include a callback -- this can remain empty for now, but we'll update it in a bit to show todos in different states.

    Router.map(function() {
      this.resource('todos', { path: '/' }, function() {
        // Need a nest to get 'index'
      });
    });

*We don't have to create a todos/index route, because as of Ember 1.5 [the default behavior is to inherit the model from the parent route](http://emberjs.com/blog/2014/03/30/ember-1-5-0-and-ember-1-6-beta-released.html#toc_routes-inherit-model).*

## Show incomplete todos

Swap out the `<a href="active">` anchor, for a `{% raw %}{{link-to}}{% endraw %}` helper:

{% highlight html %}
{% raw %}

{{#link-to "todos.active" activeClass="selected"}}Active{{/link-to}}

{% endraw %}
{% endhighlight %}

Now we can add this `todos.active` route to our router.

Run `ember generate route todos/active`.

This will add `this.route('todos/active');` to the bottom of the `map`, but what we want is for it to be nested within the pre-existing 'todos' resource:

{% highlight js %}

Router.map(function() {
  this.resource('todos', { path: '/' }, function() {
    this.route('active');
  });
});

{% endhighlight %}

Now we update the model for this route, in the file generated at `app/routes/todos/active`. At the same time, we specify that we want to re-use the template that the index route uses, by using the `renderTemplate` hook:

{% highlight js %}

import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.filter('todo', function(todo) {
      return !todo.get('is_completed');
    });
  },
  renderTemplate: function(controller) {
    this.render('todos/index', {
      controller: controller
    });
  }
});

{% endhighlight %}

## Show complete todos

To show only completed todos, the procedure is pretty much identical to the previous step. The main difference is what's being returned from the `model` hook.

Swap out the `<a href="completed">` anchor, for a `{% raw %}{{link-to}}{% endraw %}` helper:

{% highlight html %}
{% raw %}

{{#link-to "todos.completed" activeClass="selected"}}Active{{/link-to}}

{% endraw %}
{% endhighlight %}

Run `ember generate route todos/completed`.

Update the router:

{% highlight js %}

Router.map(function() {
  this.resource('todos', { path: '/' }, function() {
    this.route('active');
    this.route('completed');
  });
});

{% endhighlight %}

Add the `model` and `renderTemplate` hooks in `app/routes/todos/completed.js`:

{% highlight js %}

import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.filter('todo', function(todo) {
      return todo.get('is_completed');
    });
  },
  renderTemplate: function(controller) {
    this.render('todos/index', {
      controller: controller
    });
  }
});

{% endhighlight %}

## Return to showing all todos

Swap out the `<a href="all">` anchor for a `{% raw %}{{link-to}}{% endraw %}` helper:

{% highlight html %}
{% raw %}

{{#link-to "todos.index" activeClass="selected"}}All{{/link-to}}

{% endraw %}
{% endhighlight %}

## Display a button to remove all completed todos

Now we need a button (only visible if there's one or more completed todos) that lets users delete all todos at once.

We'll start by wrapping the `<button id="clear-completed">` in a conditional and adding a dynamic number of completed items:

{% highlight html %}
{% raw %}

{{#if has_completed}}
  <button id="clear-completed">
    Clear completed ({{completed}})
  </button>
{{/if}}

{% endraw %}
{% endhighlight %}

Then we'll add the `has_completed` property on the todos controller (`app/controllers/todos.js`), and the `completed` property that outputs the number of completed todos:

{% highlight js %}

// truncated
completed: function() {
  return this.filterBy('is_completed', true).get('length');
}.property('@each.is_completed');
has_completed: function() {
  return this.get('completed') > 0;
}.property('completed'),
// truncated

{% endhighlight %}

Now, we'll add a `clearCompleted` action to the button:

{% highlight html %}
{% raw %}

{{#if hasCompleted}}
  <button id="clear-completed" {{action "clearCompleted"}}>
    Clear completed ({{completed}})
  </button>
{{/if}}

{% endraw %}
{% endhighlight %}

Then define this action's behaviour in the todos controller's `actions` hash:

{% highlight js %}

clearCompleted: function() {
  var completed = this.filterBy('is_completed', true);

  completed.invoke('deleteRecord');
  completed.invoke('save');
}

{% endhighlight %}

This `clearCompleted` method calls the `invoke` method which is part of the [EmberArray API](http://emberjs.com/api/classes/Ember.Array.html#method_invoke). It will execute a method on each object in the Array if the method exists on that object; so we tell the completed models to delete themselves and save the fact that they're deleted.

## Display when all are completed

Replace `<input type="checkbox" id="toggle-all">` with an `{% raw %}{{input}}{% endraw %}` helper that has its `checked` attribute equal to an `all_are_completed` property:

{% highlight html %}
{% raw %}

{{input
  type="checkbox"
  id="toggle-all"
  checked=all_are_completed}}

{% endraw %}
{% endhighlight %}

Now, add the `all_are_completed` property to the todos controller:

{% highlight js %}

// truncated
all_are_completed: function() {
  return !!this.get('length') && this.isEvery('is_completed');
}.property('@each.is_completed'),
// truncated

{% endhighlight %}

## Toggle status of all todos

Finally, we check to see if our `all_are_completed` method is being used as a getter or a setter:

{% highlight js %}

// truncated
all_are_completed: function(key, value) {
  if (value === undefined) { // Getter
    return !!this.get('length') && this.isEvery('is_completed');
  } else { // Setter
    this.setEach('is_completed', value);
    this.invoke('save');
    return value;
  }
}.property('@each.is_completed'),
// truncated

{% endhighlight %}

If it's a getter, we're not doing anything new; if it's a setter, we `setEach` item in the array to the value passed in (by way of the `#toggle-all` checkbox), then have the array `invoke` the `save` method on each of its todos.

## Replace the fixture adapter with a localStorage adapter

When using the Ember Localstorage Adapter within an Ember CLI project, you can install it as an addon:

`bower install --save-dev ember-localstorage-adapter`

Then in Brocfile.js import it before `module.exports`:

{% highlight js %}

app.import('bower_components/ember-localstorage-adapter/localstorage_adapter.js');

module.exports = app.toTree();

{% endhighlight %}

Now, update `app/adapters/application.js` to use this adapter, giving it a sensible namespace:

{% highlight js %}

import DS from 'ember-data';

export default DS.LSAdapter.extend({
  namespace: 'todos-emberjs'
});

{% endhighlight %}

Now, todos created, deleted and updated, will be preserved in the browser's localStorage, across page refreshes.
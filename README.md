# Chip Utils

Utility methods used in some of the libraries created with Chip.

## Getting Started

To use these utilites in your own project install using npm.

```
npm install chip-utils
```

## Class

This utility provides syntactic sugar on normal JavaScript class inheritance supporting additional features such as
getters/setters and static inheriance.

To set up class inheritance, extend from the generic Class object. Then your classes will have an `extend` method and
can use it to extend to subclasses.

```js
var Class = require('chip-utils/class');

function MyClass() {

}

Class.extend(MyClass);

function SubClass() {

}

MyClass.extend(SubClass);
```

Static properties will also be extended. You may use the `static` member property as a shortcut to defining statics, but
this is not necessary.

```js
// Parent class
function Resource(data) {
  if (data) {
    Object.keys(data).forEach(function(key) {
      this[key] = data[key];
    }, this);
  }
}

Resource.uri = '/api/v1'
Resource.load = function() {
  var ResourceType = this;
  return $.getJSON(this.uri).then(function(items) {
    return items.map(function(item) {
      return new ResourceType(item);
    })
  });
};

Class.extend(Resource, {
  save: function() {
    var uri = this.constructor.uri + '/' + this.id;
    // Save code here
  };
});

function Person(data) {
  Resource.call(this, data);
}

Resource.extend(Person);

// Define this AFTER calling extend writes it
Person.uri += '/people'

Person.load() // returns a promise full of Person objects
```

Using the `static` member property:

```js
Resource.extend(Person, {
  static: {
    uri: '/api/v1/people'
  }
});
```

Mixins or multiple inhertiance allows for adding methods from multiple classes.

```js
// Person will inherit from Resource, but will also get the methods from EventTarget
function Person(data) {
  // Calling both constructors to ensure we are initialized correctly
  Resource.call(this, data);
  EventTarget.call(this);
}

Resource.extend(Person, EventTarget, {
  save: function() {
    this.dispatchEvent(new Event('save'));
    return Resource.prototype.save.call(this);
  }
});

var p = new Person();
p.on('save', function() {
  console.log('Person was saved!');
});
```

The extended mixins and the prototype of the class can safely use getters/setters.

```js
function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}

Class.extend(Person, {
  get name() {
    return this.firstName + ' ' + this.lastName;
  },
  set name(value) {
    var parts = value.split(' ');
    this.firstName = parts[0];
    this.lastName = parts[1];
  }
});

function Friend(firstName, lastName, nickName) {
  Person.call(this, firstName, lastName);
  this.nickName = nickName;
}

Person.extend(Friend, {
  get name() {
    return this.nickName;
  },
  set name(value) {
    this.nickName = value;
  }
});

var rando = new Person('John', 'Smith');
var friend = new Friend('Robert', 'Haroldson', 'Bob');
console.log(rando.name); // John Smith
console.log(friend.name); // Bob
friend.name = 'Rob';
console.log(friend.nickName); // Rob
```

## EventTarget

This utility ties into the browser eventing system and exposes it for your libraries to use. This does not work in
node.js. `EventTarget` extends from `Class` so anything extending it will take advantage of the extension system. Or it
may be used as a mixin as described above, just be sure to call the constructor within your subclass' constructor.

To extend the event target:

```js
var EventTarget = require('chip-utils/event-target');

function MyClass() {
  EventTarget.call(this);
}

EventTarget.extend(MyClass, {
  save: function() {
    // Use the cancelable flag to allow actions to be canceled by listeners
    var event = new Event('saving', { cancelable: true });
    this.dispatchEvent(event);

    if (!event.defaultPrevented) {
      var self = this;

      $.ajax(
        type: 'PUT',
        url: '/items/' + this.id,
        contentType: 'application/json',
        data: JSON.stringify(this)
      ).then(function() {
        // Signal the save is complete
        self.dispatchEvent(new Event('save'));
      }, function(err) {
        // Use custom events to add additional data
        self.dispatchEvent(new CustomEvent('error', { detail: err}));
      });
    }
  }
});
```

To listen to events on an event target (or remove listeners:

```js
var obj = new MyClass();

obj.on('saving', function(event) {
  if (event.target.ownerId !== me.id) {
    event.preventDefault();
  }
});

// Will only get called once
obj.one('save', function() {
  alert('First save');
});

// `on` and `off` are aliases of `addEventListener` and `removeEventListener`
obj.addEventListener('save', myListener);
obj.removeEventListener('save', myListener);
obj.on('save', myListener);
obj.off('save', myListener);
```

### Note

This EventTarget class will only work in the browser (or jsdom) since it uses a native EventTarget to work with the
browser's eventing system. It does not support bubbling.


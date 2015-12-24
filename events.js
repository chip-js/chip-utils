module.exports = EventEmitter;
var extend = require('./extend');

/**
 * A browser-based event emitter that takes advantage of the built-in C++ eventing the browser provides, giving a
 * consistent eventing mechanism everywhere in your front-end app.
 */
function EventEmitter(emitter) {
  if (this instanceof EventEmitter) {
    emitter = this;
  } else if (!emitter) {
    throw new TypeError('EventEmitter called without passing an object to extend');
  }

  var node = document.createTextNode('');

  // Add event listener
  emitter.on = emitter.addEventListener = function(type, listener) {
    node.addEventListener(type, listener);
  };

  // Removes event listener
  emitter.off = emitter.removeEventListener = function(type, listener) {
    node.removeEventListener(type, listener);
    if (listener.__events_one) {
      node.removeEventListener(type, listener.__events_one);
    }
  };

  // Add event listener to only get called once, returns wrapped method for removing if needed
  emitter.one = function one(type, listener) {
    if (typeof listener !== 'function') return;
    if (!listener.__events_one) {
      Object.defineProperty(listener, '__events_one', { value: function(event) {
        emitter.off(type, listener.__events_one);
        listener.call(event);
      }});
    }
    emitter.on(type, listener.__events_one);
  }

  // Dispatch event and trigger listeners
  emitter.dispatchEvent = function dispatchEvent(event) {
    Object.defineProperty(event, 'target', { value: emitter });
    return node.dispatchEvent(event);
  }
}

extend(EventEmitter);

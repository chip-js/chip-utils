var slice = Array.prototype.slice;

/**
 * Simplifies extending classes and provides static inheritance. Classes that need to be extendable should
 * extend Class which will give them the `extend` static function for their subclasses to use. In addition to
 * a prototype, mixins may be added as well. Example:
 *
 * function MyClass(arg1, arg2) {
 *   SuperClass.call(this, arg1);
 *   this.arg2 = arg2;
 * }
 * SuperClass.extend(MyClass, mixin1, AnotherClass, {
 *   foo: function() {
 *     this._bar++;
 *   },
 *   get bar() {
 *     return this._bar;
 *   }
 * });
 *
 * In addition to extending the superclass, static methods and properties will be copied onto the subclass for
 * static inheritance. This allows the extend function to be copied to the subclass so that it may be
 * subclassed as well. Additionally, static properties may be added by defining them on a special prototype
 * property `static` making the code more readable.
 *
 * @param {function} The subclass constructor.
 * @param {object} [optional] Zero or more mixins. They can be objects or classes (functions).
 * @param {object} The prototype of the subclass.
 */
function Class() {}
Class.extend = extend;
Class.makeInstanceOf = makeInstanceOf;
module.exports = Class;

function extend(Subclass /* [, prototype [,prototype]] */) {
  var prototypes, SuperClass = this;

  // Support no constructor
  if (typeof Subclass !== 'function') {
    prototypes = slice.call(arguments);
    Subclass = function() {
      SuperClass.apply(this, arguments);
    };
  } else {
    prototypes = slice.call(arguments, 1);
  }

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(Subclass, this);
  } else {
    Subclass.__proto__ = this;
  }

  prototypes.forEach(function(proto) {
    if (typeof proto === 'function') {
      addStatics(proto, Subclass);
    } else if (proto.hasOwnProperty('static')) {
      addStatics(proto.static, Subclass);
    }
  });

  var descriptors = getDescriptors(prototypes);
  descriptors.constructor = { writable: true, configurable: true, value: Subclass };
  descriptors.super = { configurable: true, value: SuperClass.prototype };
  Subclass.prototype = Object.create(this.prototype, descriptors);
  if (typeof SuperClass.onExtend === 'function') {
    // Allow for customizing the definitions of your child classes
    SuperClass.onExtend(Subclass, prototypes);
  }
  return Subclass;
}

// Get descriptors (allows for getters and setters) and sets functions to be non-enumerable
function getDescriptors(objects) {
  var descriptors = {};

  objects.forEach(getDescriptorsHelper.bind(this, descriptors));

  return descriptors;
}

function getDescriptorsHelper(descriptors, object) {
  if (typeof object === 'function') object = object.prototype;

  Object.getOwnPropertyNames(object).forEach(getDescriptorsNameHelper.bind(this, descriptors, object));
}

function getDescriptorsNameHelper(descriptors, object, name) {
  if (name === 'static') return;

  var descriptor = Object.getOwnPropertyDescriptor(object, name);

  if (typeof descriptor.value === 'function') {
    descriptor.enumerable = false;
  }

  descriptors[name] = descriptor;
}

// Copies static methods over for static inheritance
function addStatics(statics, Subclass) {

  // static method inheritance (including `extend`)
  Object.keys(statics).forEach(function(key) {
    var descriptor = Object.getOwnPropertyDescriptor(statics, key);
    if (!descriptor.configurable) return;

    Object.defineProperty(Subclass, key, descriptor);
  });
}


/**
 * Makes a native object pretend to be an instance of class (e.g. adds methods to a DocumentFragment then calls the
 * constructor).
 */
function makeInstanceOf(object) {
  var args = slice.call(arguments, 1);
  Object.defineProperties(object, getDescriptors([this.prototype]));
  this.apply(object, args);
  return object;
}

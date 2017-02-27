module.exports = LinkedList;
var Class = require('./class');
var nodeDescriptors = {
  __linkedList: {
    writable: true,
    configurable: true,
    value: null
  },
  __prev: {
    writable: true,
    configurable: true,
    value: null
  },
  __next: {
    writable: true,
    configurable: true,
    value: null
  },
};


/**
 * A doubley-linked linked list that uses objects as the nodes adding 3 properties, __linkedList, __next, and __prev.
 * For use when needing to add/remove items from a list frequently and needing to keep the order.
 */
function LinkedList() {
  this.head = null;
  this.tail = null;
}


Class.extend(LinkedList, {

  static: {
    makeNode: function(node) {
      Object.defineProperties(node, nodeDescriptors);
    }
  },

  add: function(node) {
    if (!node) {
      return;
    }

    if (node.__linkedList) {
      node.__linkedList.remove(node);
    } else if (!node.hasOwnProperty('__linkedList')) {
      LinkedList.makeNode(node);
    }

    node.__linkedList = this;

    if (this.tail) {
      node.__prev = this.tail;
      this.tail.__next = node;
      this.tail = node;
    } else {
      this.head = this.tail = node;
    }
  },

  remove: function(node) {
    if (!node || node.__linkedList !== this) {
      return;
    }

    if (!node.__prev) {
      this.head = node.__next;
    } else {
      node.__prev.__next = node.__next;
    }

    if (!node.__next) {
      this.tail = node.__prev;
    } else {
      node.__next.__prev = node.__prev;
    }

    node.__linkedList = null;
    node.__prev = null;
    node.__next = null;
  },

  forEach: function(iter, context) {
    var node = this.head, index = 0;
    while (node) {
      iter.call(context, node, index++, this);
      node = node.__next;
    }
  },

  toArray: function() {
    var array = [];
    this.forEach(function(node) {
      array.push(node);
    });
    return array;
  }
});

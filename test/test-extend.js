var extend = require('../extend');

describe('extend', function() {
  var Class;

  beforeEach(function() {
    Class = function Class(){};
    Subclass = function Subclass(){};
  });


  it('should add an extend function to a class', function() {
    extend(Class);
    expect(typeof Class.extend).to.equal('function');
  });


  it('should allow a sublcass to extend a super class', function() {
    extend(Class);
    Class.extend(Subclass);
    var obj = new Subclass();
    expect(obj instanceof Subclass).to.be.true;
    expect(obj instanceof Class).to.be.true;
  });


  it('should work with getters and setters', function() {
    extend(Class, {
      get foo() {
        return 'bar';
      }
    });

    var obj = new Class()
    expect(obj.foo).to.equal('bar');
  });


  it('should overwrite inherited members', function() {
    extend(Class, {
      who: function() {
        return 'world';
      },
      sayHi: function() {
        return 'Hello ' + this.who();
      }
    });

    Class.extend(Subclass, {
      who: function() {
        return 'you';
      }
    });

    var obj = new Subclass();
    expect(obj.sayHi()).to.equal('Hello you');
  });
});

var Class = require('../class');

describe('extend', function() {
  var Superclass, Subclass;

  beforeEach(function() {
    Superclass = function Superclass(){};
    Subclass = function Subclass(){};
  });


  it('should add an extend function to a class', function() {
    Class.extend(Superclass);
    expect(typeof Class.extend).to.equal('function');
  });


  it('should allow a sublcass to extend a super class', function() {
    Class.extend(Superclass);
    Superclass.extend(Subclass);
    var obj = new Subclass();
    expect(obj instanceof Subclass).to.be.true;
    expect(obj instanceof Superclass).to.be.true;
  });


  it('should work with getters and setters', function() {
    Class.extend(Superclass, {
      get foo() {
        return 'bar';
      }
    });

    var obj = new Superclass()
    expect(obj.foo).to.equal('bar');
  });


  it('should overwrite inherited members', function() {
    Class.extend(Superclass, {
      who: function() {
        return 'world';
      },
      sayHi: function() {
        return 'Hello ' + this.who();
      }
    });

    Superclass.extend(Subclass, {
      who: function() {
        return 'you';
      }
    });

    var obj = new Subclass();
    expect(obj.sayHi()).to.equal('Hello you');
  });


  it('should support static inheritance', function() {
    Class.extend(Superclass, {
      static: {
        who: function() {
          return 'world';
        },
        sayHi: function() {
          return 'Hello ' + this.who();
        }
      }
    });

    Superclass.test = 'testing';

    expect(Superclass).to.have.property('test');
    expect(Superclass).to.have.property('who');
    expect(Superclass).to.have.property('sayHi');

    Superclass.extend(Subclass, {
      static: {
        who: function() {
          return 'you';
        }
      }
    });

    expect(Subclass).to.have.property('test');
    expect(Subclass).to.have.property('who');
    expect(Subclass).to.have.property('sayHi');

    expect(Subclass.sayHi()).to.equal('Hello you');
  });


  it('should fake make an instace of a class', function() {
    var called = 0;
    var MyClass = function() {
      called++;
    };

    Class.extend(MyClass, {
      foo: function() {
        return 'bar';
      }
    });

    var fragment = document.createDocumentFragment();
    MyClass.makeInstanceOf(fragment);

    expect(called).to.equal(1);
    expect(fragment).to.have.property('foo');
    expect(fragment.foo()).to.equal('bar');
  });
});

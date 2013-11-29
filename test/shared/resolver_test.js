var ServiceResolver = require('../../src/shared/resolver.js');
var Freight = require('freight.js');
var Transit = require('ticket.js/src/transit.js');
var Promise = require('bluebird');

describe('Collection', function(){

  var defaultController = {
    index: function() {

    }
  };

  var r, f, t;
  beforeEach(function(){
    f = new Freight();
    r = new ServiceResolver(f);
    t = new Transit('/index', Promise);
  });

  it("Construction, check interface", function(){

    r.getArguments.should.be.an.instanceOf(Function);
    r.getFunction.should.be.an.instanceOf(Function);    
    r.getScope.should.be.an.instanceOf(Function);    
    r.container.should.equal(f);

  });

  it("get Scope", function(){

    //default should use the original
    var scope = r.getScope(t);
    scope.should.equal(t);

    t.setAttribute('_controller', 'controllers.default:index');

    (function(){
      scope = r.getScope(t);  //no controllers
    }).should.throw();

    f.register('controllers.cars', {
      shared: "true",
      factoryFn: function() {
        return defaultController;
      },
      tags: ['controller']
    });
    
    f.register('controllers.default', {
      shared: "true",
      factoryFn: function() {
        return defaultController;
      }
    });

    (function(){
      scope = r.getScope(t); //not tagged
    }).should.throw();


    f.register('controllers.default', {
      factoryFn: function() {
        return defaultController;
      },
      tags: ['controller']
    });

    scope = r.getScope(t);
    scope.should.equal(defaultController);

  });


  it("get function", function(){


    var fn = r.getFunction(t);
    fn.should.equal(false);

    t.setAttribute('_controller', 'controllers.default:bogus');
    f.register('controllers.default', {
      factoryFn: function() {
        return defaultController;
      },
      tags: ['controller']
    });

    (function(){
        r.getFunction(t);
    }).should.throw();

    t.setAttribute('_controller', 'controllers.default:index');
    fn = r.getFunction(t);
    
    fn.should.equal(defaultController.index);

  });

  it("get arguments", function(){

    t.setAttribute('_controller', 'controllers.default:index');
    t.setAttribute('name', 'test');

    var args = r.getArguments(t);
    args.length.should.equal(1);
    args[0].should.equal('test');

  });


});
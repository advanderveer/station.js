var Resolver = require('ticket.js/src/resolver.js');
var ServiceResolver = function(container) {
  var self = this;
  var parent = ServiceResolver.prototype;

  var getControllerAttribute = function(transit) {
    if(transit.hasAttribute('_controller')) {
      return transit.getAttribute('_controller');
    }
    return false;
  };

  var getControllerService = function(str) {
    var args = str.split(self.ACTION_SEPERATOR);
    var ids = container.findTaggedServiceIds(self.CONTROLLER_TAG);
    var id = args[0];

    if(ids.indexOf(id) === -1)
      throw new Error('Could not find an controller named: "'+str+'", registered services under tag "'+self.CONTROLLER_TAG+'": [' + ids + ']');

    var controller = container.get(id);
    var action = args[1];

    if(typeof controller[action] !== 'function') {
      throw new Error('The provided controller "'+id+'" does not have function named: "'+action+'"');
    }

    return {
      scope: controller,
      fn: controller[action] 
    };
  };

  /**
   * The container used for resolving
   * 
   * @type {Freight}
   */
  self.container = container;

  /**
   * The tag that indicates controller services
   * 
   * @type {String}
   */
  self.ACTION_SEPERATOR = ':';

  /**
   * The tag that indicates controller services
   * 
   * @type {String}
   */
  self.CONTROLLER_TAG = 'controller';

  /**
   * Get the controller object from the dependency container
   * 
   * @param  {Transit} transit the transit
   * @return {Object}  the object (scope)
   */
  self.getScope = function getScope(transit) {

    var str = getControllerAttribute(transit);
    if(typeof str !== 'string')
      return parent.getScope(transit);

    var res = getControllerService(str);
    return res.scope;
  };

  /**
   * Get the function from the dependency container
   * 
   * @param  {Transit} transit the transit
   * @return {Function} the function
   */
  self.getFunction = function getFunction(transit) {
    var str = getControllerAttribute(transit);
    if(typeof str !== 'string')
      return parent.getFunction(transit);

    var res = getControllerService(str);
    return res.fn;
  };


};


//extends basic resolver
ServiceResolver.prototype = new Resolver();
ServiceResolver.prototype.constructor = ServiceResolver; 

module.exports = ServiceResolver;
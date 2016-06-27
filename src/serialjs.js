/**
 * serialjs 1.0.0
 * @author Steven Lariau
 */

(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    define([], function(){
      return (root.serial = factory());
    });
  } else if(typeof module === "object" && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = (root.serial = factory());
  } else {
    root.serial = factory();
  }
}(this, function() {

  var _ = {};


  //Library definition



  //#Utils



  /**
   * Indicates if a variable is of type function
   * @param {any} o - the variable to test type
   * @return {boolean}
   */
  function isFunction(o)
  {
    return o && Object.prototype.toString.call(o) === "[object Function]";
  }

  /**
   * Indicates if a variable is of type litteral object
   * @param {any} o - the variable to test type
   * @return {boolean}
   */
  function isObjectLiteral(o)
  {
    return Object.prototype.toString.call(o) === "[object Object]";
  }


  /**
   * Polyfill for Object.Create, with the first argument only
   * @param {Object} obj
   * @return {Object}
   */
  function objectCreate(obj)
  {
    var F = function(){};
    F.prototype = obj;
    return new F();
  }

  /**
   * Add own properties of source object to the destination object
   * @param {Object} dest - destination object
   * @param {Object} src - source object
   * @return {Object} destination object
   */
  function objectExtend(dest, src)
  {
    for(var key in src)
      if(src.hasOwnProperty(key))
        dest[key] = src[key];
    return dest;
  }



  var __serialClasses = {};

  /**
   * Handle class serialization / unserialization
   * @mixin
   */
  var serialMixin = {

    /**
     * Returns a JSON representation of the pbject
     * Returns a litteral object containing all properties of the object,
     * except functions
     * @return {Object}
     */
    _getJSON: function()
    {
      var json = {};

      for(var key in this)
        if(this.hasOwnProperty(key) && !isFunction(this[key]))
          json[key] = this[key];

      return json;
    },

    /**
     * Inits the object with the value returned by "_getJSON"
     * Called by the function "unserialize"
     * Extends the object with the json object
     * @param {Object} json
     */
    _initFromJSON: function(json)
    {
      objectExtend(this, json);
      this._onJSONInit();
    },

    /**
     * Called at the end of "_initFromJSON"
     * Usefull to initialize non-serialisable properties
     */
    _onJSONInit: function()
    {

    }



  };
  _.serialMixin = serialMixin;



  /**
   * Creates the function to convert an instance to a JSON object
   * @param {Object} dst - object receiving the method
   * @param {string} id - unique identifier of the class
   * @return {Object}
   */
  function addJSONMethod(dst, id)
  {
    dst.toJSON = function()
    {
      return {
        "__serial_id_": id,
        "d": this._getJSON()
      };
    }
  }


  /**
   * Registrers a class
   * Replace the toJSON method
   * Add the serial mixin methods if therere are no overloading defined
   * @param {Class} Class
   * @param {string} id - unique identifier of the class
   */
  function registerSerializable(Class, id)
  {
    __serialClasses[id] = Class;
    addJSONMethod(Class.prototype, id);

    if(!Class.prototype._getJSON)
      Class.prototype._getJSON = serialMixin._getJSON;
    if(!Class.prototype._initFromJSON)
      Class.prototype._initFromJSON = serialMixin._initFromJSON;
    if(!Class.prototype._onJSONInit)
      Class.prototype._onJSONInit = serialMixin._onJSONInit;

  }
  _.registerSerializable = registerSerializable;



  /**
   *  Returns a JSON string representation of the variable
   * @param {any} x
   * @return {string}
   */
  function serialize(x)
  {
    return JSON.stringify(x);
  }
  _.serialize = serialize;


  /**
   * Create a variabe from it's JSON string representation
   * @param {string} str
   * @return {any}
   */
  function unserialize(str)
  {
    return JSON.parse(str, function(key, val) {
      if(isObjectLiteral(val) && val.hasOwnProperty("__serial_id_"))
      {

        var id = val["__serial_id_"];
        var obj;

        if(__serialClasses[id])
        {
          var Class = __serialClasses[id];
          obj = objectCreate(Class.prototype);
        }
        else
        {
          throw new Error("Unknown serialization id " + id);
        }



        obj._initFromJSON(val.d);
        return obj;
      }
      else
        return val;
    });
  }

  _.unserialize = unserialize;





  return _;
 }));

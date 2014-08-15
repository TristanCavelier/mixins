/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  // Version: 0.1.1

  // Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
  // This program is free software. It comes without any warranty, to
  // the extent permitted by applicable law. You can redistribute it
  // and/or modify it under the terms of the Do What The Fuck You Want
  // To Public License, Version 2, as published by Sam Hocevar. See
  // the COPYING file for more details.

  /*jslint indent: 2, nomen: true, vars: true */

  /**
   *     objectHasOwnProperty(object, prop): Boolean
   *
   * The objectHasOwnProperty() method returns a boolean indicating whether the object
   * has the specified property.
   *
   * @param  {Object} object The object to use
   * @param  {String} prop The property name
   * @return {Boolean} The result
   */
  var objectHasOwnProperty =
    Function.prototype.call.bind(Object.prototype.hasOwnProperty);

  function MixinManager() {
    this._mixins = {};
    this._constructors = {};
  }

  MixinManager.prototype.register = function (id, creator, Constructor) {
    if (objectHasOwnProperty(this._mixins, id)) {
      throw new TypeError("MixinManager.register: ID `" + id + "` is already defined");
    }
    // id.replace(/[^0-9A-Za-z_.\- ]/, function () {
    //   throw new TypeError("MixinManager.register: incorrect ID");
    // });
    if (typeof creator !== "function") {
      throw new TypeError("MixinManager.register: Argument 2 is not a function.");
    }
    this._mixins[id] = creator;
    if (Constructor !== undefined) {
      if (typeof Constructor !== "function") {
        throw new TypeError("MixinManager.register: Argument 3 is not a constructor.");
      }
      this._constructors[id] = Constructor;
    }
  };

  // O(n)
  //      Nodes       Roots NonRoots   parse(id)
  // t1 - A-B         A     B          Parsing A (B is one of its children) (no need to parse all nodes to see it). If a child is absent, then error.
  //                                   If parsed node not in NonRoots: Add it in Roots
  //                                   ForEach children: if not already built:
  //                                                     Set in stack, if already in stack then error. Remove child from Roots. Add child to NonRoots.
  //                                                     Remove child from nodes. Convert this childId to parse(childId).
  //                                   Instanciate node with parsed children
  // t2 - A-B-C       A     B          Parsing B (C and D is one of its children) [...]
  //         'D             C
  //                        D
  // t3 - A-B-C       A     B          Parsing C, it has no children. [...]
  //         'D             C
  //                        D
  // t4 - A-B-C       A     B          Parsing D, it has no children. [...]
  //         'D             C
  //                        D
  // t5 - E-A-B-C     E     B          Parsing E (A is one of its children) [...]
  //           'D           C
  //                        D
  //                        A
  // If Roots.length > 1 or < 1, then error. return root.instance
  MixinManager.prototype.parse = function (description) {
    var mixins = this._mixins, nodes = {}, roots = {}, nonRoots = {}, i, il;
    function parse(id, stack) {
      var args, j, jl, childId;
      if (stack[id]) {
        throw new TypeError("MixinManager.parse: Infinite graph detected");
      }
      if (!nodes[id]) {
        // this id is not in nodes database, add it
        if (!description[id]) {
          throw new TypeError("MixinManager.parse: description should contains objects");
        }
        if (!mixins[description[id].object]) {
          throw new TypeError("MixinManager.parse: Object `" + description[id].object + "` is not defined in mixin registry");
        }
        if (description[id].args !== undefined) {
          if (!Array.isArray(description[id].args)) {
            throw new TypeError("MixinManager.parse: description args should be an array");
          }
        }
        nodes[id] = {"args": JSON.parse(JSON.stringify(description[id].args || []))};
      }
      if (!nonRoots[id]) { roots[id] = true; }

      if (nodes[id].instance) { return nodes[id].instance; }

      stack[id] = true;
      args = nodes[id].args;
      for (j = 0, jl = args.length; j < jl; j += 1) {
        if (typeof args[j] === "string" && args[j][0] === "$") {
          childId = args[j].slice(1);
          if (!description[childId]) {
            throw new TypeError("MixinManager.parse: Unknown reference to ID `" + childId + "`");
          }
          delete roots[childId];
          nonRoots[childId] = true;
          args[j] = parse(childId, stack);
        }
      }
      delete stack[id];
      nodes[id].instance = mixins[description[id].object].apply(null, args);
      return nodes[id].instance;
    }
    /*jslint forin: true */
    for (i in description) { parse(i, {}); }
    il = 0;
    for (i in roots) {
      if (il === 1) {
        throw new TypeError("MixinManager.parse: description graph should not contain several roots");
      }
      il += 1;
    }
    if (il === 0) {
      throw new TypeError("MixinManager.parse: description graph should contain one root");
    }
    return nodes[i].instance;
  };

  var mixinManager = new MixinManager();
  root.mixinManager = mixinManager;

  mixinManager.register("args", function () {
    return arguments;
  });

  mixinManager.register("object", function (object) {
    return object;
  });

  mixinManager.register("date", function (date) {
    return new Date(date);
  });

  var reRegexp = /^\/((?:[^\\\/]|\\.)*)\/([a-z]*)$/i;
  mixinManager.register("regexp", function (regexp) {
    var parsed = reRegexp.exec(regexp);
    if (parsed) {
      return new RegExp(parsed[1], parsed[2]);
    }
    return new RegExp(regexp);
  });

  // Allow to mix several mixin descriptions. It is useful when you have a third
  // party description which might have similar ids than your custom description.
  //
  //     {
  //       "myID": { // <---------------.
  //         "object": "array",         |
  //         "args": [0, "$otherID"]    |
  //       },                           |
  //       "otherID": {                !=
  //         "object": "mixin",         |
  //         "args": [{                 |
  //           "myID": { // <-----------'
  //             "object": "array",
  //             "args": [1, 2]
  //           }
  //         }]
  //       }
  //     }
  mixinManager.register("mixin", function (description) {
    // keep using this mixinManager instead of root.mixinManager that may change
    return mixinManager.parse(description);
  });

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(root.mixinManager, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      var constructors, script = "(" + factory.toString() + "(this));\n";
      try {
        constructors = root.mixinManager._constructors;
        return script + Object.keys(
          constructors
        ).reduce(function (string, id) {
          if (typeof constructors[id].toScript === "function") {
            return string + constructors[id].toScript();
          }
          return string;
        }, "");
      } catch (ignore) {}
      return script;
    }
  });

}(this));

/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  /*
   Version: 0.2.0

   Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>

   This program is free software. It comes without any warranty, to
   the extent permitted by applicable law. You can redistribute it
   and/or modify it under the terms of the Do What The Fuck You Want
   To Public License, Version 2, as published by Sam Hocevar. See
   below for more details.

   ___________________________________________________________________
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |                   Version 2, December 2004                        |
  |                                                                   |
  |Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>                   |
  |                                                                   |
  |Everyone is permitted to copy and distribute verbatim or modified  |
  |copies of this license document, and changing it is allowed as long|
  |as the name is changed.                                            |
  |                                                                   |
  |           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE             |
  |  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION  |
  |                                                                   |
  | 0. You just DO WHAT THE FUCK YOU WANT TO.                         |
  |___________________________________________________________________|

  */

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

  function update(a, b) {
    /*jslint forin: true */
    var k;
    for (k in b) { a[k] = b[k]; }
    return a;
  }

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

  /*jslint regexp: true, ass: true */
  var eat = {};

  var reStrJSONExp = "(?:[eE][\\-\\+]?[0-9]+)";
  var reStrJSONFrac = "(?:\\.[0-9]+)";
  var reStrJSONInt = "(?:-?(?:[1-9][0-9]*|[0-9]))";
  var reStrJSONNumber = "(?:" + reStrJSONInt + "(?:" + reStrJSONFrac + reStrJSONExp + "?|" + reStrJSONExp + "|))";
  var reStrJSONChar = "(?:[^\\x00-\\x1F\\x7F\"\\\\]|\\\\[\"\\\\/bfnrt]|\\\\u[0-9]{4})";
  var reStrJSONString = "(?:\"" + reStrJSONChar + "*\")";

  var reEatWhiteSpacesIfThere = /^(\s*)(.*)/;
  eat.JSONObject = function (text) {
    var tmp, tmp2, object = {};
    if ((tmp = (/^(\{)(.*)/).exec(text)) === null) { return null; }
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp2 = (/^(\})(.*)/).exec(tmp[2])) !== null) {
      return update([text, text.slice(0, -tmp2[2].length), tmp2[2]], {"object": {}, "input": text, "index": 0});
    }
    if ((tmp = eat.JSONPair(tmp[2])) === null) { return null; }
    object[tmp.object.key] = tmp.object.value;
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    while ((tmp2 = (/^(,)(.*)/).exec(tmp[2])) !== null) {
      tmp2 = reEatWhiteSpacesIfThere.exec(tmp2[2]);
      if ((tmp = eat.JSONPair(tmp2[2])) === null) { return null; }
      if (objectHasOwnProperty(object, tmp.object.key)) {
        return null; // same key found
      }
      object[tmp.object.key] = tmp.object.value;
      tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    }
    if ((tmp = (/^(\})(.*)/).exec(tmp[2])) === null) { return null; }
    return update([text, text.slice(0, text.length - tmp[2].length), tmp[2]], {"object": object, "input": text, "index": 0});
  };

  eat.JSONPair = function (text) {
    var tmp, object = {};
    if ((tmp = eat.JSONString(text)) === null) { return null; }
    object.key = tmp.object;
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp = (/^(:)(.*)/).exec(tmp[2])) === null) { return null; }
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp = eat.JSONValue(tmp[2])) === null) { return null; }
    object.value = tmp.object;
    return update([text, text.slice(0, text.length - tmp[2].length), tmp[2]], {"object": object, "input": text, "index": 0});
  };

  eat.JSONArray = function (text) {
    var tmp, tmp2, object = [];
    if ((tmp = (/^(\[)(.*)/).exec(text)) === null) { return null; }
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    if ((tmp2 = (/^(\])(.*)/).exec(tmp[2])) !== null) {
      return update([text, text.slice(0, -tmp2[2].length), tmp2[2]], {"object": [], "input": text, "index": 0});
    }
    if ((tmp = eat.JSONValue(tmp[2])) === null) { return null; }
    object.push(tmp.object);
    tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    while ((tmp2 = (/^(,)(.*)/).exec(tmp[2])) !== null) {
      tmp2 = reEatWhiteSpacesIfThere.exec(tmp2[2]);
      if ((tmp = eat.JSONValue(tmp2[2])) === null) { return null; }
      object.push(tmp.object);
      tmp = reEatWhiteSpacesIfThere.exec(tmp[2]);
    }
    if ((tmp = (/^(\])(.*)/).exec(tmp[2])) === null) { return null; }
    return update([text, text.slice(0, text.length - tmp[2].length), tmp[2]], {"object": object, "input": text, "index": 0});
  };

  eat.JSONValue = function (text) {
    var tmp;
    if ((tmp = (eat.JSONString(text) || eat.JSONNumber(text) || eat.JSONObject(text) || eat.JSONArray(text))) !== null) {
      return tmp;
    }
    if ((tmp = (/^(true)(.*)/).exec(text)) !== null) {
      tmp.object = true;
    } else if ((tmp = (/^(false)(.*)/).exec(text)) !== null) {
      tmp.object = false;
    } else if ((tmp = (/^(null)(.*)/).exec(text)) !== null) {
      tmp.object = null;
    }
    return tmp;
  };

  var reJSONString = new RegExp("^(" + reStrJSONString + ")(.*)");
  eat.JSONString = function (text) {
    var tmp = reJSONString.exec(text);
    if (tmp === null) { return null; }
    tmp.object = JSON.parse(tmp[1]); // don't want to reimplement instanciation
    return tmp;
  };

  var reJSONNumber = new RegExp("^(" + reStrJSONNumber + ")(.*)");
  eat.JSONNumber = function (text) {
    var tmp = reJSONNumber.exec(text);
    if (tmp === null) { return null; }
    tmp.object = JSON.parse(tmp[1]); // don't want to reimplement instanciation
    return tmp;
  };

  var reStrRawChar = "[^\\x00-\\x1F\\x7F\",:\\[\\]\\{\\}\\(\\)]";
  // var reStrRawChar = "[a-zA-Z0-9]";
  var reEatRawString = new RegExp("^(" + reStrRawChar + "+)(.*)");

  var reEatColumn = /^(:)(.*)/;
  var reEatComma = /^(,)(.*)/;
  //var reEatTextUntilSpecialChar = /^([^\[:,]+)(.*)/;

  /*jslint regexp: false, ass: false */

  // Converts the description string to a description object
  // /!\ this is not a JSON string !
  // description examples:
  // - 'ajax'
  // - 'ajax,base64["$ajax"]'
  // - 'myajax:ajax,base64["$myajax"]'
  function stringToJSON(description) {
    /*jslint ass: true */
    var tmp, iter = description, name, id, descriptionObject = {}, args;
    while (true) {
      if ((tmp = eat.JSONString(iter)) !== null || (tmp = reEatRawString.exec(iter)) !== null) {
        iter = tmp[2];
        name = tmp.object !== undefined ? tmp.object : tmp[1];
        if ((tmp = reEatColumn.exec(iter)) !== null) {
          iter = tmp[2];
          if ((tmp = eat.JSONString(iter)) === null && (tmp = reEatRawString.exec(iter)) === null) {
            throw new SyntaxError("MixinManager.stringToJSON: id given to `" + name + "` should contain at least one character");
          }
          iter = tmp[2];
          id = tmp.object !== undefined ? tmp.object : tmp[1];
        } else {
          id = name;
        }
        if ((tmp = eat.JSONArray(iter)) !== null) {
          iter = tmp[2];
          args = tmp.object;
          // throw new SyntaxError("MixinManager.stringToJSON: arguments of `" + name + "` are not JSON parsable");
        }
        if (descriptionObject[name]) {
          throw new TypeError("MixinManager.stringToJSON: `" + name + "` is set more than once");
        }
        descriptionObject[name] = {"object": id};
        if (args) { descriptionObject[name].args = args; }
        if (iter !== "") {
          if ((tmp = reEatComma.exec(iter)) === null) {
            throw new SyntaxError("MixinManager.stringToJSON: expected `,` or end after arguments or id given to `" + name + "`");
          }
          name = undefined;
          id = undefined;
          args = undefined;
          iter = tmp[2];
        } else {
          break;
        }
      } else {
        throw new SyntaxError("MixinManager.stringToJSON: identifier expected");
      }
    }
    return descriptionObject;
  }

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
  function parseObject(description) {
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
  }

  // detects if description is a string or an object, and tries to make a mixin from it
  MixinManager.prototype.parse = function (description) {
    if (typeof description === "string") {
      try {
        description = JSON.parse(description);
      } catch (e) {
        return parseObject.call(this, stringToJSON.call(this, description));
      }
    }
    if (typeof description !== "object" || description === null) {
      throw new TypeError("MixinManager.parse: description should be a valid non empty string or an object");
    }
    return parseObject.call(this, description);
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

  /*jslint regexp: true */
  var reRegexp = /^\/((?:[^\\\/]|\\.)*)\/([a-z]*)$/i;
  /*jslint regexp: false */
  mixinManager.register("regexp", function (regexp) {
    var parsed = reRegexp.exec(regexp);
    if (parsed) { return new RegExp(parsed[1], parsed[2]); }
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

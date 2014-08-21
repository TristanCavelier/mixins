/*jslint indent: 2 */
(function (root) {
  "use strict";
  /*
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

  /*jslint indent: 2 */
  /*global test, ok, deepEqual, module */

  module("Mixin Manager");

  root.mixinManager.register("one", function (one) {
    return [one];
  });
  root.mixinManager.register("two", function (one, two) {
    return [one, two];
  });

  test("id 'one' & 'two' registered", function () {
    ok(true);
  });

  root.mixinManager.register("hasOwnProperty", function () {
    return [];
  });
  root.mixinManager.register("toString", function () {
    return [];
  });

  test("confusing id 'hasOwnProperty' & 'toString' registered", function () {
    ok(true);
  });

  test("cannot register twice", function () {
    try {
      root.mixinManager.register("cannot register twice", function () {
        return [];
      });
    } catch (b) {
      return ok(false, b);
    }
    var error = {"name": "No Error"};
    try {
      root.mixinManager.register("cannot register twice", function () {
        return [];
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.register: ID `cannot register twice` is already defined"]);
  });

  // test("register invalid id", function () {
  //   var error = {"name": "No Error"};
  //   try {
  //     root.mixinManager.register("/invalid", function () {
  //       return [];
  //     });
  //   } catch (e) {
  //     error = e;
  //   }
  //   deepEqual([error.name, error.message], ["TypeError", "MixinManager.register: incorrect ID"]);
  // });

  test("one node (empty description)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({});
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: description graph should contain one root"]);
  });

  test("one node (bad description root)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": null
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: description should contains objects"]);
  });

  test("one node (bad description root)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": true
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: Object `undefined` is not defined in mixin registry"]);
  });

  test("one node (undefined mixin)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": {
          "object": "blue"
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: Object `blue` is not defined in mixin registry"]);
  });

  test("one node (bad mixin args format)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": null
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: description args should be an array"]);
  });

  test("one node (no children)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1", "2"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, ["1"]);
  });

  test("one node (confusing arg)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": [{"$b": "$b"}]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, [{"$b": "$b"}]);
  });

  test("one node (missing children)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1", "$b"]
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: Unknown reference to ID `b`"]);
  });

  test("one node (auto referencing)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1", "$a"]
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: Infinite graph detected"]);
  });

  test("two nodes (no children)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1"]
        },
        "b": {
          "object": "two",
          "args": ["2", "3"]
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: description graph should not contain several roots"]);
  });

  test("one root, one leaf", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1", "2"]
        },
        "b": {
          "object": "two",
          "args": ["1", "$a"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, ["1", ["1"]]);
  });

  test("one root, two leaves", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1", "2"]
        },
        "b": {
          "object": "two",
          "args": ["$c", "$a"]
        },
        "c": {
          "object": "two",
          "args": ["2", "3"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, [["2", "3"], ["1"]]);
  });

  test("one root, two ways, one shared leaf", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "two",
          "args": ["$left", "$right"]
        },
        "left": {
          "object": "one",
          "args": ["$leaf"]
        },
        "right": {
          "object": "one",
          "args": ["$leaf"]
        },
        "leaf": {
          "object": "one",
          "args": ["hello"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    ok(out[0][0] === out[1][0]);
    deepEqual(out, [[["hello"]], [["hello"]]]);
  });

  test("should not modify description", function () {
    var out, description, descriptionClone;
    try {
      description = {
        "a": {
          "object": "one",
          "args": ["1", "2"]
        },
        "b": {
          "object": "two",
          "args": ["3", "$a"]
        }
      };
      descriptionClone = JSON.parse(JSON.stringify(description));
      out = root.mixinManager.parse(description);
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(description, descriptionClone);
  });

  test("built-in 'args' instanciation", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "args",
          "args": ["a", "b", "c"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, {"0": "a", "1": "b", "2": "c"});
    deepEqual(out.length, 3);
  });

  test("built-in 'object' instanciation", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "object",
          "args": [{"a": "b"}]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, {"a": "b"});
  });

  test("built-in 'date' instanciation", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "date",
          "args": ["2001"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out.getFullYear(), 2001);
  });

  test("built-in 'date' instanciation (invalid date)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "date",
          "args": ["lol"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    ok(isNaN(out.getTime()));
  });

  test("built-in 'regexp' instanciation (basic string)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "regexp",
          "args": ["my value"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out.toString(), '/my value/');
  });

  test("built-in 'regexp' instanciation (complex string)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "regexp",
          "args": ["/my value/"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out.toString(), '/my value/');
  });

  test("built-in 'regexp' instanciation (confusing character)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "regexp",
          "args": ["/my\\/value/"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out.toString(), '/my\\/value/');
  });

  test("built-in 'regexp' instanciation (confusing sentence)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "regexp",
          "args": ["/my/value/g"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out.toString(), '/\\/my\\/value\\/g/');
  });

  test("built-in 'regexp' instanciation (with flags)", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "regexp",
          "args": ["/my value/g"]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out.toString(), '/my value/g');
  });

  test("built-in 'regexp' instanciation (wrong flags)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "root": {
          "object": "regexp",
          "args": ["/my value/gW"]
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["SyntaxError", "invalid regular expression flag W"]);
  });

  test("built-in 'mixin' instanciation", function () {
    var out;
    try {
      out = root.mixinManager.parse({
        "root": {
          "object": "mixin",
          "args": [{
            "root": {
              "object": "one",
              "args": ["a"]
            }
          }]
        }
      });
    } catch (e) {
      return ok(false, e);
    }
    deepEqual(out, ["a"]);
  });

  test("built-in 'mixin' instanciation (try to reference parent id)", function () {
    var error = {"name": "No Error"};
    try {
      root.mixinManager.parse({
        "a": {
          "object": "one",
          "args": ["1"]
        },
        "b": {
          "object": "mixin",
          "args": [{
            "c": {
              "object": "one",
              "args": ["$a"]
            }
          }]
        }
      });
    } catch (e) {
      error = e;
    }
    deepEqual([error.name, error.message], ["TypeError", "MixinManager.parse: Unknown reference to ID `a`"]);
  });

}(this));

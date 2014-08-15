/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  /*
   Version: 0.1.0

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

  /*jslint indent: 2, nomen: true */

  // Dependency:
  // - Promise (native)

  function _copyObjectKeys(o1, o2) {
    /*jslint forin: true */
    var k;
    for (k in o2) {
      o1[k] = o2[k];
    }
    return o1;
  }

  function MemoryLayout() {
    this._vars = {};
  }

  // rest mixin method: head(url) -> response< empty >
  MemoryLayout.prototype.head = function (url) {
    var it = this._vars;
    return new root.Promise(function (resolve, reject) {
      if (it._vars[url]) {
        resolve({
          "status": 200,
          "headers": {
            "content-type": [it._vars[url].type || "application/octet-stream"]
          }
        });
      } else {
        reject(_copyObjectKeys(new Error("MemoryLayout: HEAD: variable not found"), {"status": 404}));
      }
    });
  };

  // rest mixin method: get(url) -> response< Blob >
  MemoryLayout.prototype.get = function (url) {
    var it = this._vars;
    return new root.Promise(function (resolve, reject) {
      if (it._vars[url]) {
        return resolve({
          "status": 200,
          "data": it._vars[url],
          "headers": {
            "content-type": [it._vars[url].type || "application/octet-stream"]
          }
        });
      }
      return reject(_copyObjectKeys(new Error("MemoryLayout: GET: variable not found"), {"status": 404}));
    });
  };

  // rest mixin method: put(url, data) -> response< empty >
  MemoryLayout.protoype.put = function (url, data) {
    var it = this._vars;
    return new root.Promise(function (resolve) {
      it._vars[url] = data;
      return resolve({"status": 204, "headers": {}});
    });
  };

  // rest mixin method: delete(url) -> response< empty >
  MemoryLayout.prototype["delete"] = function (url) {
    var it = this._vars;
    return new root.Promise(function (resolve) {
      delete it._vars[url];
      return resolve({"status": 204, "headers": {}});
    });
  };

  root.MemoryLayout = MemoryLayout;

  if (root.mixinManager) {
    try {
      root.mixinManager.register("memory", function () {
        return new MemoryLayout();
      }, MemoryLayout);
    } catch (e) {
      if (root.console && typeof root.console.warn === "function") {
        try { root.console.warn(e); } catch (ignore) {}
      }
    }
  }

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(MemoryLayout, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));

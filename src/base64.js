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

  /*jslint indent: 2, nomen: true */

  // Dependencies:
  // - Promise (native)
  // - Blob (native)
  // - FileReader (native)
  // - btoa (native)
  // - atob (native)
  // - sequence (https://github.com/TristanCavelier/notesntools/blob/master/javascript/promise-tools/sequence.js)
  // Optional dependencies:
  // - mixinManager (https://github.com/TristanCavelier/mixins/blob/master/src/mixin-manager.js)
  // - CancellablePromise (https://github.com/TristanCavelier/notesntools/blob/master/javascript/promise-tools/CancellablePromise.js)
  // - CancellablePromise.sequence

  function newPromise(executor, canceller) {
    var Cons = root.CancellablePromise || root.Promise;
    return new Cons(executor, canceller);
  }

  function sequence(thenArray) {
    return ((root.CancellablePromise && root.CancellablePromise.sequence) || root.sequence)(thenArray);
  }

  function readBlobAsBinaryString(blob) {
    var fr = new root.FileReader();
    return newPromise(function (resolve, reject) {
      fr.addEventListener("load", function () { resolve(fr.result); });
      fr.addEventListener("error", function () {
        reject(new Error("readBlobAsBinaryString: Cannot read blob"));
      });
      fr.readAsBinaryString(blob);
    }, function () {
      fr.abort();
    });
  }

  /**
   * @param mixin {Mixin}
   * @param options {Object}
   * @param options.noGet {Boolean}
   * @param options.noPut {Boolean}
   */
  function Base64Layout(mixin, options) {
    this._mixin = mixin;

    if (options) {
      if (options.noGet) { this._noGet = true; }
      if (options.noPut) { this._noPut = true; }
    }

    // make unmanaged methods unavailable
    var methodName;
    for (methodName in Base64Layout.prototype) {
      /*jslint forin: true */
      if (typeof this._mixin[methodName] !== "function") {
        this[methodName] = null;
      }
    }
  }

  // rest mixin method: head(url) -> response< empty >
  Base64Layout.prototype.head = function (url) {
    return this._mixin.head(url);
  };

  // rest mixin method: get(url) -> response< Blob >
  Base64Layout.prototype.get = function (url) {
    if (this._noGet) { return this._mixin.get(url); }
    var it = this;
    return sequence([function () {
      return it._mixin.get(url);
    }, readBlobAsBinaryString, root.atob]);
  };

  // rest mixin method: put(url, data) -> response< empty >
  Base64Layout.prototype.put = function (url, data) {
    if (this._noPut) { return this._mixin.put(url, data); }
    var it = this;
    return sequence([function () {
      return readBlobAsBinaryString(data);
    }, function (text) {
      return it._mixin.put(url, new root.Blob(
        [root.btoa(text)],
        {"type": (data.type || "application/octet-stream") + ";base64"}
      ));
    }]);
  };

  // rest mixin method: delete(url) -> response< empty >
  Base64Layout.prototype["delete"] = function (url) {
    return this._mixin["delete"](url);
  };

  root.Base64Layout = Base64Layout;

  if (root.mixinManager) {
    try {
      root.mixinManager.register("base64", function (mixin, options) {
        return new Base64Layout(mixin, options);
      }, Base64Layout);
    } catch (e) {
      if (root.console && typeof root.console.warn === "function") {
        try { root.console.warn(e); } catch (ignore) {}
      }
    }
  }

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(Base64Layout, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));

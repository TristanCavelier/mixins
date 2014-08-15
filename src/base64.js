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

  /*jslint indent: 2, nomen: true */

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
   */
  function Base64Layout(mixin) {
    this._mixin = mixin;

    // make unmanaged methods unavailable
    var methodName;
    for (methodName in Base64Layout.prototype) {
      /*jslint forin: true */
      if (typeof this._mixin[methodName] !== "function") {
        this[methodName] = null;
      }
    }
  }

  // rest (no stream) mixin method: head(url) -> response< empty >
  Base64Layout.prototype.head = function (url) {
    return this._mixin.head(url);
  };

  // rest (no stream) mixin method: get(url) -> response< Blob >
  Base64Layout.prototype.get = function (url) {
    var it = this;
    return sequence([function () {
      return it._mixin.get(url);
    }, readBlobAsBinaryString, root.atob]);
  };

  // rest (no stream) mixin method: put(url, data) -> response< empty >
  Base64Layout.prototype.put = function (url, data) {
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

  // rest (no stream) mixin method: delete(url) -> response< empty >
  Base64Layout.prototype["delete"] = function (url) {
    return this._mixin["delete"](url);
  };

  root.Base64Layout = Base64Layout;

  if (root.mixinManager) {
    try {
      root.mixinManager.register("base64", function (mixin) {
        return new Base64Layout(mixin);
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

/*jslint indent: 2 */
(function factory(root) {
  "use strict";

  // Version: 0.1.0

  // Copyright (c) 2014 Tristan Cavelier <t.cavelier@free.fr>
  // This program is free software. It comes without any warranty, to
  // the extent permitted by applicable law. You can redistribute it
  // and/or modify it under the terms of the Do What The Fuck You Want
  // To Public License, Version 2, as published by Sam Hocevar. See
  // the COPYING file for more details.

  /*jslint indent: 2, nomen: true */
  /*global btoa, atob, Blob, FileReader */

  function newPromise(executor, canceller) {
    var Cons = (root.promy && root.promy.Promise) || root.Promise;
    return new Cons(executor, canceller);
  }

  function spawn(generator) {
    return ((root.promy && root.promy.spawn) || root.spawn)(generator);
  }

  function readBlobAsBinaryString(blob) {
    return newPromise(function (resolve, reject) {
      var fr = new FileReader();
      fr.addEventListener("load", function () { resolve(fr.result); });
      fr.addEventListener("error", function () {
        reject(new Error("readBlobAsBinaryString: Cannot read blob"));
      });
      fr.readAsBinaryString(blob);
    });
  }

  /**
   * @param mixin {Mixin}
   */
  function Base64Layout(mixin) {
    this._mixin = mixin;
  }

  // rest (no stream) mixin method: head(url) -> response< empty >
  Base64Layout.prototype.head = function (url) {
    return this._mixin.head(url);
  };

  // rest (no stream) mixin method: get(url) -> response< Blob >
  Base64Layout.prototype.get = function (url) {
    return spawn(function* () {
      return atob(yield readBlobAsBinaryString(yield this._mixin.get(url)));
    });
  };

  // rest (no stream) mixin method: put(url, data) -> response< empty >
  Base64Layout.prototype.put = function (url, data) {
    return spawn(function* () {
      return this._mixin.put(url, new Blob(
        [btoa(yield readBlobAsBinaryString(data))],
        {"type": (data.type || "application/octet-stream") + ";base64"}
      ));
    });
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
      console.warn("Base64Layout: Cannot add `base64` to mixin manager");
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

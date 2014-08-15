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
    var Cons = (root.promy && root.promy.Promise) || root.Promise;
    return new Cons(executor, canceller);
  }

  /**
   *     then(executor): promise< value >
   *
   * Execute the `executor` synchronously and converts its returned value into a
   * thenable.
   *
   * @param  {Function} executor XXX
   * @return {Promise} XXX
   */
  function then(executor) {
    var value;
    try {
      value = executor();
    } catch (e) {
      return newPromise(function (_, reject) { reject(e); });
    }
    if (value && typeof value.then === "function") {
      return value;
    }
    return newPromise(function (resolve) { resolve(value); });
  }

  /**
   * sequence(thens): Promise
   *
   * Executes a sequence of *then* callbacks. It acts like
   * `smth().then(callback).then(callback)...`. The first callback is called
   * with no parameter.
   *
   * Elements of `thens` array can be a function or an array contaning at most
   * three *then* callbacks: *onFulfilled*, *onRejected*, *onNotified*.
   *
   * When `cancel()` is executed, each then promises are cancelled at the same
   * time.
   *
   * @param  {Array} thens An array of *then* callbacks
   * @return {Promise} A new promise
   */
  function sequence(thens) {
    var promises = [];
    return new RSVP.Promise(function (resolve, reject, notify) {
      var i;
      promises[0] = then(thens[i]);
      for (i = 0; i < thens.length; i += 1) {
        if (Array.isArray(thens[i])) {
          promises[i + 1] = promises[i].then(thens[i][0], thens[i][1], thens[i][2]);
        } else {
          promises[i + 1] = promises[i].then(thens[i]);
        }
      }
      promises[i].then(resolve, reject, notify);
    }, function () {
      var i;
      for (i = 0; i < promises.length; i += 1) {
        promises[i].cancel();
      }
    });
  }

  function readBlobAsBinaryString(blob) {
    return newPromise(function (resolve, reject) {
      var fr = new root.FileReader();
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

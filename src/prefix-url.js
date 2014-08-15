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

  /**
   * @param mixin {Mixin}
   */
  function PrefixURLLayout(prefix, mixin, suffix) {
    this._prefix = prefix || "";
    this._mixin = mixin;
    this._suffix = suffix || "";
  }

  // rest mixin method: head(url) -> response< empty >
  PrefixURLLayout.prototype.head = function (url) {
    return this._mixin.head(this._prefix + url + this._suffix);
  };

  // rest mixin method: get(url) -> response< Blob >
  PrefixURLLayout.prototype.get = function (url) {
    return this._mixin.get(this._prefix + url + this._suffix);
  };

  PrefixURLLayout.prototype.post = function (url, data) {
    return this._mixin.post(this._prefix + url + this._suffix, data);
  };

  // rest mixin method: put(url, data) -> response< empty >
  PrefixURLLayout.prototype.put = function (url, data) {
    return this._mixin.put(this._prefix + url + this._suffix, data);
  };

  // rest mixin method: delete(url) -> response< empty >
  PrefixURLLayout.prototype["delete"] = function (url) {
    return this._mixin["delete"](this._prefix + url + this._suffix);
  };

  root.PrefixURLLayout = PrefixURLLayout;

  if (root.mixinManager) {
    try {
      root.mixinManager.register("prefix url", function (prefix, mixin, suffix) {
        return new PrefixURLLayout(prefix, mixin, suffix);
      }, PrefixURLLayout);
    } catch (e) {
      if (root.console && typeof root.console.warn === "function") {
        try { root.console.warn(e); } catch (ignore) {}
      }
    }
  }

  /**
   * Prepare `toScript` function to export easily this library as a string.
   */
  Object.defineProperty(PrefixURLLayout, "toScript", {
    "configurable": true,
    "enumerable": false,
    "writable": true,
    "value": function () {
      return "(" + factory.toString() + "(this));\n";
    }
  });

}(this));
